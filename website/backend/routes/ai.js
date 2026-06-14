const express = require('express');
const https = require('https');
const { AppError } = require('../middleware/errorHandler');
const { staticProducts } = require('../data/staticProducts');
const { staticMembershipTiers } = require('../data/staticMembershipTiers');

const router = express.Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
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
- Keep replies concise but complete. Prefer 2-5 short paragraphs or a short bullet list when useful.
- Finish every answer cleanly. Do not stop mid-word or mid-sentence.
- When details are missing, ask only one question at a time. Do not ask for occasion, budget, size, color, and wearer all in one message.
- Use this order for styling follow-ups: occasion first, then budget, then who it is for, then size/fit, then color preference.
- If the user already gives enough information, answer directly instead of asking another question.
- For styling requests, consider occasion, wearer, budget, color, fit, size, and comfort.
- If the user's request is vague, ask for the minimum details needed.
- When you need clarification, respond with exactly one short sentence and ask exactly one question. Do not use bullets, headings, or extra explanation.
- If you ask a follow-up, start with a helpful phrase like "To help me narrow this down for you," and end with one question mark.
- The chat opens fresh each time, so do not assume long-term memory.
- Never reveal chain-of-thought, analysis steps, hidden checklists, or internal decision-making.
- Never begin with labels like "Analyze the user's input", "Consult the Catalog", "Identify missing details", "Draft the response", or similar meta commentary.
- Do not explain your reasoning process. Return only the final customer-facing answer or one short follow-up question.

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

const reasoningMarkers = [
  /Analyze the user's input/i,
  /Consult the Catalog/i,
  /Identify missing details/i,
  /Formulate the response/i,
  /Draft the response/i,
  /The user is asking/i,
  /According to the instructions/i,
  /Let's list/i,
  /Follow-up question/i,
  /I should/i,
  /No bullets/i,
  /numbered steps/i,
  /headings/i,
  /labels/i,
  /multiple paragraphs/i,
  /^1\.\s+/m,
  /^2\.\s+/m,
  /^3\.\s+/m,
];

const looksLikeReasoningDump = (text) => reasoningMarkers.some((pattern) => pattern.test(text));

const stripReasoningPreamble = (text) => {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return '';

  const firstUsefulLineIndex = lines.findIndex((line) => {
    const lower = line.toLowerCase();
    return (
      !/^(\d+\.|[-*])\s*/.test(line) &&
      !lower.startsWith('analyze the user') &&
      !lower.startsWith('consult the catalog') &&
      !lower.startsWith('identify missing details') &&
      !lower.startsWith('formulate the response') &&
      !lower.startsWith('draft the response') &&
      !lower.startsWith('the user is asking') &&
      !lower.startsWith('according to the instructions') &&
      !lower.startsWith("let's list") &&
      !lower.startsWith('follow-up question') &&
      !lower.startsWith('i should') &&
      !lower.includes('no bullets') &&
      !lower.includes('numbered steps') &&
      !lower.includes('headings') &&
      !lower.includes('labels') &&
      !lower.includes('multiple paragraphs')
    );
  });

  if (firstUsefulLineIndex <= 0) {
    return lines.join('\n').trim();
  }

  return lines.slice(firstUsefulLineIndex).join('\n').trim();
};

const collapseToSingleCustomerSentence = (text) => {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const normalized = lines.join(' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const sentences = normalized.match(/[^.!?]+[.!?]/g) || [];
  const questionSentence = [...sentences].reverse().find((sentence) => sentence.includes('?'));
  if (questionSentence) {
    return questionSentence.trim();
  }

  if (sentences.length) {
    return sentences[0].trim();
  }

  return lines[0] || normalized;
};

const isStyleRequest = (messages) => {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const text = String(lastUserMessage?.content || '').toLowerCase();
  return (
    text.includes('style') ||
    text.includes('outfit') ||
    text.includes('wear') ||
    text.includes('budget') ||
    text.includes('rs ') ||
    text.includes('price') ||
    text.includes('occasion')
  );
};

const cleanFallbackReply = (messages, reply) => {
  const normalized = collapseToSingleCustomerSentence(stripReasoningPreamble(reply));
  if (normalized && !looksLikeReasoningDump(normalized)) {
    return normalized;
  }

  if (isStyleRequest(messages)) {
    return 'To help me narrow this down for you, what is the occasion you are shopping for?';
  }

  return normalized || 'Could you share a bit more detail so I can help?';
};

const rewriteCustomerFacingReply = async ({ rawReply, pageContext }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return stripReasoningPreamble(rawReply);
  }

  const rewritePrompt = `
Rewrite the text below into a clean customer-facing reply for the House of Styles AI assistant.
- Remove all hidden reasoning, analysis steps, checklists, and meta commentary.
- Keep only the final answer or one short follow-up question.
- If the text is a follow-up request, output exactly one short sentence and exactly one question mark.
- Do not include bullets, numbered steps, headings, labels, or multiple paragraphs.
- Do not mention that you rewrote anything.
- Keep the tone natural, mature, and helpful.

Current website page: ${pageContext}

Text to rewrite:
${rawReply}
`.trim();

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await callGemini({
        pageContext,
        messages: [
          {
            role: 'user',
            content: rewritePrompt,
          },
        ],
      });
      const rewritten = extractGeminiOutputText(response);
      return rewritten || stripReasoningPreamble(rawReply);
    }

    const response = await callOpenAI({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'Rewrite customer-facing copy only. Remove all reasoning, analysis, and checklist text.',
            },
          ],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: rewritePrompt }],
        },
      ],
      max_output_tokens: 300,
      temperature: 0.2,
    });

    const rewritten = extractOpenAIOutputText(response);
    return rewritten || stripReasoningPreamble(rawReply);
  } catch {
    return stripReasoningPreamble(rawReply);
  }
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
        temperature: 0.2,
        maxOutputTokens: 500,
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
      max_output_tokens: 500,
      temperature: 0.2,
    });

    reply = extractOpenAIOutputText(aiResponse);
  }

  if (looksLikeReasoningDump(reply)) {
    reply = await rewriteCustomerFacingReply({ rawReply: reply, pageContext });
  }

  reply = cleanFallbackReply(messages, reply);

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
