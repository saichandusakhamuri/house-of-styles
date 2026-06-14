(function () {
  const quickPrompts = [
    "Style me for a wedding",
    "Find options under Rs 5000",
    "Help with custom tailoring",
    "Explain VIP and payments",
  ];

  const catalog = [
    {
      name: "Regal Ivory Sherwani",
      category: "Wedding Wear",
      audience: "Wedding",
      price: 8999,
      colors: ["Ivory", "Gold"],
      sizes: ["M", "L", "XL"],
      note: "best for a premium groom or family wedding look",
    },
    {
      name: "Rose Gold Reception Gown",
      category: "Party Wear",
      audience: "Party",
      price: 6499,
      colors: ["Rose Gold"],
      sizes: ["S", "M", "L"],
      note: "a polished reception or evening event choice",
    },
    {
      name: "Tailored Linen Co-ord",
      category: "Casual Wear",
      audience: "Everyday",
      price: 2499,
      colors: ["Sage", "Cream"],
      sizes: ["XS", "S", "M", "L"],
      note: "easy, breathable, and refined for daily wear",
    },
    {
      name: "Festive Kurta Set",
      category: "Formal Wear",
      audience: "Festive",
      price: 3299,
      colors: ["Maroon", "Ivory"],
      sizes: ["S", "M", "L", "XL"],
      note: "strong value for festive events and family functions",
    },
    {
      name: "Princess Twirl Occasion Set",
      category: "Party Wear",
      audience: "Party",
      price: 2199,
      colors: ["Pink", "Lavender"],
      sizes: ["3Y", "5Y", "7Y"],
      note: "comfortable occasion wear for kids",
    },
    {
      name: "Custom Fit Power Blazer",
      category: "Formal Wear",
      audience: "Everyday",
      price: 5799,
      colors: ["Navy", "Charcoal"],
      sizes: ["Custom"],
      note: "best when fit and tailoring matter most",
    },
    {
      name: "Pearl Pastel Lehenga",
      category: "Wedding Wear",
      audience: "Wedding",
      price: 11299,
      colors: ["Pearl", "Pastel Pink"],
      sizes: ["S", "M", "L", "Custom"],
      note: "a premium bridal or close-family wedding option",
    },
    {
      name: "Signature Indo-Western Set",
      category: "Tailored",
      audience: "Festive",
      price: 4899,
      colors: ["Taupe", "Coffee"],
      sizes: ["M", "L", "Custom"],
      note: "a modern fusion choice with custom flexibility",
    },
  ];

  const starterMessages = [
    {
      role: "bot",
      text:
        "Hi, I am Stylist from House of Styles. Tell me the occasion, budget, preferred color, size, and who it is for. I can compare outfits, suggest custom tailoring details, explain VIP/payment options, and help you decide without interrupting your shopping.",
    },
  ];

  function freshMessages() {
    return starterMessages.map((message) => ({ ...message }));
  }

  function freshConversation() {
    return {
      budget: null,
      category: "",
      audience: "",
      colors: [],
      size: "",
      recipient: "",
      occasion: "",
      lastTopic: "",
    };
  }

  function getPageContext() {
    const path = window.location.pathname;
    if (path.includes("vip")) {
      return "VIP Club";
    }
    if (path.includes("custom")) {
      return "Custom Studio";
    }
    return "Storefront";
  }

  function formatPrice(amount) {
    return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
  }

  function includesAny(text, terms) {
    return terms.some((term) => text.includes(term));
  }

  function extractBudget(text) {
    const compactText = text.replace(/,/g, "");
    const explicitAmount = compactText.match(/(?:rs|inr|₹)?\s*(\d{3,6})/i);
    if (explicitAmount) {
      return Number(explicitAmount[1]);
    }

    if (includesAny(text, ["cheap", "affordable", "budget", "low price"])) return 3000;
    if (includesAny(text, ["premium", "luxury", "bridal", "best one"])) return 12000;
    return null;
  }

  function updateConversation(message, conversation) {
    const text = message.toLowerCase();
    const next = { ...conversation };
    const budget = extractBudget(text);

    if (budget) next.budget = budget;

    if (includesAny(text, ["wedding", "marriage", "bride", "bridal", "groom", "sherwani", "lehenga"])) {
      next.category = "Wedding Wear";
      next.audience = "Wedding";
      next.occasion = "wedding";
    } else if (includesAny(text, ["party", "reception", "evening", "night", "birthday"])) {
      next.category = "Party Wear";
      next.audience = "Party";
      next.occasion = text.includes("reception") ? "reception" : "party";
    } else if (includesAny(text, ["office", "formal", "work", "business", "meeting", "interview"])) {
      next.category = "Formal Wear";
      next.audience = "Everyday";
      next.occasion = "formal";
    } else if (includesAny(text, ["casual", "daily", "regular", "weekend", "comfort"])) {
      next.category = "Casual Wear";
      next.audience = "Everyday";
      next.occasion = "casual";
    } else if (includesAny(text, ["festive", "festival", "function", "family"])) {
      next.audience = "Festive";
      next.occasion = "festive";
    } else if (includesAny(text, ["custom", "tailor", "stitched", "bespoke", "alteration"])) {
      next.category = "Tailored";
      next.lastTopic = "custom";
    }

    const colorWords = ["ivory", "gold", "rose gold", "sage", "cream", "maroon", "pink", "lavender", "navy", "charcoal", "pearl", "pastel", "taupe", "coffee", "black", "white", "blue", "red"];
    next.colors = [...new Set([...next.colors, ...colorWords.filter((color) => text.includes(color))])];

    const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|3y|5y|7y|custom)\b/i);
    if (sizeMatch) next.size = sizeMatch[1].toUpperCase();

    if (includesAny(text, ["kid", "child", "daughter", "son"])) next.recipient = "kid";
    if (includesAny(text, ["men", "man", "male", "groom", "husband", "boy"])) next.recipient = "men";
    if (includesAny(text, ["women", "woman", "female", "bride", "wife", "girl"])) next.recipient = "women";

    return next;
  }

  function scoreProduct(product, conversation, text) {
    let score = 0;

    if (conversation.category && product.category === conversation.category) score += 5;
    if (conversation.audience && product.audience === conversation.audience) score += 3;
    if (conversation.budget && product.price <= conversation.budget) score += 4;
    if (conversation.budget && product.price > conversation.budget) score -= Math.ceil((product.price - conversation.budget) / 1500);
    if (conversation.size && product.sizes.includes(conversation.size)) score += 2;
    if (conversation.size === "CUSTOM" && product.sizes.includes("Custom")) score += 3;
    if (conversation.colors.some((color) => product.colors.join(" ").toLowerCase().includes(color))) score += 2;
    if (conversation.recipient === "kid" && product.name.toLowerCase().includes("princess")) score += 5;
    if (conversation.recipient === "men" && includesAny(product.name.toLowerCase(), ["sherwani", "kurta", "blazer", "indo-western"])) score += 2;
    if (conversation.recipient === "women" && includesAny(product.name.toLowerCase(), ["gown", "lehenga", "princess"])) score += 2;
    if (text.includes(product.name.toLowerCase())) score += 8;

    return score;
  }

  function recommendProducts(conversation, message) {
    const text = message.toLowerCase();
    const ranked = catalog
      .map((product) => ({ ...product, score: scoreProduct(product, conversation, text) }))
      .sort((a, b) => b.score - a.score || a.price - b.price);

    return ranked.filter((product) => product.score > 0).slice(0, 3);
  }

  function missingStyleDetails(conversation) {
    const missing = [];
    if (!conversation.occasion && !conversation.category && !conversation.audience) missing.push("occasion");
    if (!conversation.budget) missing.push("budget");
    if (!conversation.recipient) missing.push("who it is for");
    return missing;
  }

  function productReply(conversation, message) {
    const matches = recommendProducts(conversation, message);
    const missing = missingStyleDetails(conversation);

    if (!matches.length && missing.length) {
      return `I can narrow this properly. Please share ${missing.join(", ")}. A useful format is: "wedding outfit for women under Rs 5000 in pastel colors."`;
    }

    if (!matches.length) {
      return "I do not see a perfect catalog match from the details so far. If you share the occasion, budget, size, and color preference, I will give you the closest ready-made option and a custom-studio alternative.";
    }

    const intro = missing.length
      ? `Based on what I know so far, these are the closest options. To refine it further, tell me ${missing.join(", ")}.`
      : "Here are the strongest options from the current House of Styles catalog:";

    const options = matches
      .map((product, index) => {
        const overBudget = conversation.budget && product.price > conversation.budget ? " slightly above your budget" : "";
        return `${index + 1}. ${product.name} - ${formatPrice(product.price)}${overBudget}. ${product.note}. Colors: ${product.colors.join(", ")}. Sizes: ${product.sizes.join(", ")}.`;
      })
      .join("\n");

    const nextStep = conversation.budget && matches.every((product) => product.price > conversation.budget)
      ? "If the budget is firm, I recommend choosing the closest lower-priced category or using Custom Studio with a clear budget cap."
      : "If you like one of these, I can help compare it against another option or suggest color/accessory direction.";

    return `${intro}\n\n${options}\n\n${nextStep}`;
  }

  function customReply(conversation) {
    const garment = conversation.category === "Formal Wear" ? "blazer or kurta set" : conversation.category === "Wedding Wear" ? "sherwani, lehenga, or Indo-Western set" : "custom outfit";
    const budget = conversation.budget ? `Budget: ${formatPrice(conversation.budget)}.` : "Budget: not set yet.";
    const occasion = conversation.occasion ? `Occasion: ${conversation.occasion}.` : "Occasion: please share it.";

    return `For custom tailoring, the best brief is practical and specific:\n\n${occasion}\n${budget}\nGarment: ${garment}.\nFit: slim, regular, relaxed, or custom measurement.\nColor/fabric: share 1-2 preferred colors and whether you want matte, festive, soft, or statement fabric.\nTimeline: mention the event date.\n\nSend me those details and I will turn them into a clean tailoring brief you can use in the Custom Studio.`;
  }

  function vipReply() {
    return "VIP is useful if the customer expects repeat purchases, early access, or better support for occasion/custom orders. A simple way to decide:\n\nSilver: good for basic membership and light shopping.\nGold: better if you shop for events or family functions.\nPlatinum: best for frequent shopping, premium styling, and custom-order priority.\n\nIf you tell me how often you shop and your usual order value, I can suggest the most sensible tier.";
  }

  function paymentReply() {
    return "The site supports secure checkout paths through Razorpay for cards, netbanking, and UPI apps, plus a direct UPI handoff. If checkout does not open, the most common causes are payment gateway keys not configured, network blocking the Razorpay script, or the UPI app not being available on the device.";
  }

  function serviceReply() {
    return "I can help with store guidance, but I do not want to invent policies. For returns, delivery dates, or exchange rules, use the store contact/support route if it is available. For product decisions, I can still help compare size, budget, occasion, and custom-fit choices.";
  }

  function writingReply() {
    return "Yes. Send the rough idea and the audience. I can write product descriptions, WhatsApp replies, captions, VIP messages, tailoring briefs, or short customer-support responses in a polished House of Styles tone.";
  }

  function buildReply(message, conversation) {
    const text = message.toLowerCase();
    const context = getPageContext();

    if (text.includes("vip") || text.includes("member") || text.includes("benefit")) {
      return vipReply();
    }

    if (text.includes("custom") || text.includes("tailor") || text.includes("stitch")) {
      return customReply(conversation);
    }

    if (includesAny(text, ["pay", "payment", "upi", "razorpay", "card", "checkout", "netbanking"])) {
      return paymentReply();
    }

    if (includesAny(text, ["return", "refund", "exchange", "delivery", "shipping", "cancel"])) {
      return serviceReply();
    }

    if (includesAny(text, ["write", "content", "caption", "message", "description", "copy"])) {
      return writingReply();
    }

    if (includesAny(text, ["outfit", "style", "wear", "dress", "kurta", "lehenga", "sherwani", "gown", "blazer", "co-ord", "under", "budget", "recommend", "suggest", "choose", "compare", "color", "size", "wedding", "party", "formal", "casual", "festive"])) {
      return productReply(conversation, message);
    }

    return `I am ready on the ${context}. For a full recommendation, tell me: occasion, budget, who it is for, size, and preferred colors. You can also ask about VIP, payments, custom tailoring, or ask me to write customer-facing content.`;
  }

  function createMessageElement(message) {
    const bubble = document.createElement("div");
    bubble.className = `agent-message ${message.role}`;
    bubble.textContent = message.text;
    return bubble;
  }

  function initAgentWidget() {
    if (document.querySelector(".agent-widget")) {
      return;
    }

    let messages = freshMessages();
    let conversation = freshConversation();

    const widget = document.createElement("section");
    widget.className = "agent-widget";
    widget.setAttribute("aria-label", "HS AI chatbot");
    widget.innerHTML = `
      <div class="agent-panel" id="agentPanel" hidden>
        <header class="agent-header">
          <div class="agent-title">
            <span class="agent-avatar">HS</span>
            <span>
              <strong>Stylist</strong>
              <small>House of Styles assistant</small>
            </span>
          </div>
          <button class="agent-close" type="button" aria-label="Close HS AI">X</button>
        </header>
        <div class="agent-messages" id="agentMessages" aria-live="polite"></div>
        <div class="agent-quick-actions" aria-label="Suggested prompts"></div>
        <form class="agent-form">
          <input type="text" name="message" placeholder="Ask HS AI..." autocomplete="off" />
          <button class="agent-send" type="submit">Send</button>
        </form>
      </div>
      <button class="agent-launcher" type="button" aria-label="Open HS AI chatbot" aria-expanded="false" aria-controls="agentPanel">
        <span class="agent-launcher-mark">HS</span>
        <span class="agent-launcher-text">HS AI</span>
      </button>
    `;

    document.body.appendChild(widget);

    const panel = widget.querySelector(".agent-panel");
    const launcher = widget.querySelector(".agent-launcher");
    const closeButton = widget.querySelector(".agent-close");
    const messagesList = widget.querySelector(".agent-messages");
    const quickActions = widget.querySelector(".agent-quick-actions");
    const form = widget.querySelector(".agent-form");
    const input = form.querySelector("input");

    function renderMessages() {
      messagesList.replaceChildren(...messages.map(createMessageElement));
      messagesList.scrollTop = messagesList.scrollHeight;
    }

    function addMessage(role, text) {
      messages = [...messages, { role, text }];
      renderMessages();
    }

    function sendMessage(text) {
      const cleanText = text.trim();
      if (!cleanText) {
        return;
      }

      addMessage("user", cleanText);
      conversation = updateConversation(cleanText, conversation);
      window.setTimeout(() => addMessage("bot", buildReply(cleanText, conversation)), 220);
    }

    function openPanel() {
      messages = freshMessages();
      conversation = freshConversation();
      renderMessages();
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      window.setTimeout(() => input.focus(), 50);
    }

    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
    }

    quickPrompts.forEach((prompt) => {
      const chip = document.createElement("button");
      chip.className = "agent-chip";
      chip.type = "button";
      chip.textContent = prompt;
      chip.addEventListener("click", () => {
        openPanel();
        sendMessage(prompt);
      });
      quickActions.appendChild(chip);
    });

    launcher.addEventListener("click", () => {
      if (panel.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });

    closeButton.addEventListener("click", closePanel);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      sendMessage(input.value);
      input.value = "";
    });

    renderMessages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAgentWidget);
  } else {
    initAgentWidget();
  }
})();
