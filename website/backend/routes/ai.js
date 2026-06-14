const express = require('express');
const https = require('https');
const { AppError } = require('../middleware/errorHandler');
const { staticProducts } = require('../data/staticProducts');
const { staticMembershipTiers } = require('../data/staticMembershipTiers');

const router = express.Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const productCatalogText = staticProducts
  .filter((product) => product.isActive)
  .map((product) => {
    const price = product.finalPrice || product.basePrice;
    return [
      product.name,
      `category: ${product.category}`,
      `audience: ${product.audience}`,
      `price: Rs ${price}`,
      `sizes: ${(product.sizes || []).join(', ')}`,
      `colors: ${(product.colors || []).join(', ')}`,
      `description: ${product.description}`,
    ].join(' | ');
  })
  .join('\n');

const membershipText = staticMembershipTiers
  .map((tier) => {
    return `${tier.name}: ${tier.discountPercentage}% store discount, ${tier.customOrderDiscount}% custom order discount, annual Rs ${tier.annualPrice}, features: ${tier.features.join(', ')}`;
  })
  .join('\n');

const systemPrompt = `
You are Stylist, the House of Styles AI shopping assistant.

Your job:
- Have a natural, mature conversation like a real fashion/store assistant.
- Understand the user's intent, ask useful follow-up questions when details are missing, and make practical recommendations.
- Help with outfit selection, product comparison, VIP tiers, custom tailoring briefs, payment guidance, and concise customer-facing writing.
- Use the House of Styles catalog and membership details below. Do not invent unavailable products, prices, discounts, delivery promises, refund policy, or stock.
- If a user asks about something the store data does not define, say what you can verify and ask one focused follow-up.
- Keep replies concise but complete. Prefer 2-5 short paragraphs or a numbered shortlist.
- Finish every answer cleanly. Do not stop mid-word or mid-sentence.
- For styling requests, consider occasion, wearer, budget, color, fit, size, and comfort.
- If the user's request is vague, ask for the minimum details needed.
- The chat opens fresh each time, so do not assume long-term memory.

Current catalog:
${productCatalogText}

VIP tiers:
${membershipText}

Payment information:
The site supports Razorpay checkout for cards, netbanking, and UPI apps when configured, plus direct UPI handoff. Never ask for card numbers or payment credentials in chat.
`.trim();

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(-12)
    .map((message) => ({
      role: message.role === 'assistant' || message.role === 'bot' ? 'assistant' : 'user',
      content: String(message.text || message.content || '').trim().slice(0, 1200),
    }))
    .filter((message) => message.content);
};

const extractOpenAIOutputText = (body) => {
  if (body.output_text) {
    return body.output_text;
  }

  const parts = [];
  for (const item of body.output || []) {
    for (const content of item.content || []) {
      if (content.text) parts.push(content.text);
      if (content.type === 'output_text' && content.text) parts.push(content.text);
    }
  }

  return parts.join('\n').trim();
};

const getGeminiFinishReason = (body) => body.candidates?.[0]?.finishReason || '';

const extractGeminiOutputText = (body) => {
  const parts = [];
  for (const candidate of body.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.text) parts.push(part.text);
    }
  }

  return parts.join('\n').trim();
};

const callGemini = ({ messages, pageContext }) =>
  new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reject(new AppError('Stylist AI is not configured. Add GEMINI_API_KEY in Render environment variables.', 503));
      return;
    }

    const contents = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    const payload = {
      system_instruction: {
        parts: [{ text: `${systemPrompt}\n\nCurrent website page: ${pageContext}` }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 900,
      },
    };

    const body = JSON.stringify(payload);
    const request = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          let parsedBody;
          try {
            parsedBody = JSON.parse(responseBody);
          } catch {
            parsedBody = { message: responseBody };
          }

          if (response.statusCode >= 400) {
            reject(new AppError(parsedBody?.error?.message || 'Gemini request failed.', response.statusCode));
            return;
          }

          resolve(parsedBody);
        });
      }
    );

    request.on('error', (error) => {
      reject(new AppError(error.message || 'Gemini could not connect.', 502));
    });

    request.write(body);
    request.end();
  });

const callOpenAI = (payload) =>
  new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      reject(new AppError('Stylist AI is not configured. Add OPENAI_API_KEY in Render environment variables.', 503));
      return;
    }

    const body = JSON.stringify(payload);
    const request = https.request(
      {
        hostname: 'api.openai.com',
        path: '/v1/responses',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          let parsedBody;
          try {
            parsedBody = JSON.parse(responseBody);
          } catch {
            parsedBody = { message: responseBody };
          }

          if (response.statusCode >= 400) {
            reject(new AppError(parsedBody?.error?.message || 'Stylist AI request failed.', response.statusCode));
            return;
          }

          resolve(parsedBody);
        });
      }
    );

    request.on('error', (error) => {
      reject(new AppError(error.message || 'Stylist AI could not connect.', 502));
    });

    request.write(body);
    request.end();
  });

router.post('/stylist', async (req, res) => {
  const messages = normalizeMessages(req.body.messages);
  const pageContext = String(req.body.pageContext || 'Storefront').slice(0, 80);

  if (!messages.length) {
    throw new AppError('A message is required for Stylist.', 400);
  }

  let provider = 'gemini';
  let model = GEMINI_MODEL;
  let reply = '';

  if (process.env.GEMINI_API_KEY) {
    const aiResponse = await callGemini({ messages, pageContext });
    reply = extractGeminiOutputText(aiResponse);
    const finishReason = getGeminiFinishReason(aiResponse);
    if (finishReason && finishReason !== 'STOP') {
      throw new AppError(`Gemini stopped before completing the answer. Finish reason: ${finishReason}.`, 502);
    }
  } else {
    provider = 'openai';
    model = OPENAI_MODEL;
    const input = [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: `${systemPrompt}\n\nCurrent website page: ${pageContext}`,
          },
        ],
      },
      ...messages.map((message) => ({
        role: message.role,
        content: [{ type: 'input_text', text: message.content }],
      })),
    ];

    const aiResponse = await callOpenAI({
      model: OPENAI_MODEL,
      input,
      max_output_tokens: 900,
      temperature: 0.7,
    });

    reply = extractOpenAIOutputText(aiResponse);
  }

  if (!reply) {
    throw new AppError('Stylist AI returned an empty response.', 502);
  }

  res.json({
    success: true,
    provider,
    model,
    reply,
  });
});

module.exports = router;
