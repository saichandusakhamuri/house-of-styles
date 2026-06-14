(function () {
  const quickPrompts = [
    "Style me for a wedding",
    "Find options under Rs 5000",
    "Help with custom tailoring",
    "Explain VIP and payments",
  ];

  const starterMessages = [
    {
      role: "bot",
      text:
        "Hi, I am Stylist from House of Styles. Tell me what you need, and I will think through the best answer with you. I can help with outfits, VIP, payments, custom tailoring, sizing, comparisons, and polished customer-facing writing.",
    },
  ];

  function freshMessages() {
    return starterMessages.map((message) => ({ ...message }));
  }

  function getPageContext() {
    const path = window.location.pathname;
    if (path.includes("vip")) return "VIP Club";
    if (path.includes("custom")) return "Custom Studio";
    return "Storefront";
  }

  function getApiBaseUrl() {
    const configuredUrl = window.HOS_CONFIG?.apiBaseUrl;
    if (configuredUrl) return configuredUrl.replace(/\/$/, "");

    if (window.location.protocol === "file:") {
      return "http://10.0.2.2:5001/api";
    }

    const host = window.location.hostname || "localhost";
    return `http://${host}:5001/api`;
  }

  function normalizeForApi(messages) {
    return messages
      .filter((message) => message.role === "user" || message.role === "bot")
      .map((message) => ({
        role: message.role,
        text: message.text,
      }))
      .slice(-10);
  }

  async function askStylist(messages) {
    const response = await fetch(`${getApiBaseUrl()}/ai/stylist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pageContext: getPageContext(),
        messages: normalizeForApi(messages),
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.message || "Stylist AI is unavailable right now.");
    }

    if (!body.reply) {
      throw new Error("Stylist AI returned an empty reply.");
    }

    return body.reply;
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
    let isWaitingForReply = false;

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
    const sendButton = form.querySelector(".agent-send");

    function renderMessages() {
      messagesList.replaceChildren(...messages.map(createMessageElement));
      messagesList.scrollTop = messagesList.scrollHeight;
    }

    function setWaiting(waiting) {
      isWaitingForReply = waiting;
      input.disabled = waiting;
      sendButton.disabled = waiting;
      sendButton.textContent = waiting ? "Wait" : "Send";
    }

    function addMessage(role, text) {
      messages = [...messages, { role, text }];
      renderMessages();
    }

    function replaceLastBotMessage(text) {
      const nextMessages = [...messages];
      const lastIndex = nextMessages.length - 1;
      if (nextMessages[lastIndex]?.role === "bot") {
        nextMessages[lastIndex] = { role: "bot", text };
        messages = nextMessages;
        renderMessages();
        return;
      }

      addMessage("bot", text);
    }

    async function sendMessage(text) {
      const cleanText = text.trim();
      if (!cleanText || isWaitingForReply) {
        return;
      }

      addMessage("user", cleanText);
      addMessage("bot", "Thinking...");
      setWaiting(true);

      try {
        const reply = await askStylist(messages);
        replaceLastBotMessage(reply);
      } catch (error) {
        replaceLastBotMessage(
          error.message.includes("OPENAI_API_KEY")
            ? "Stylist is connected to the backend, but the real AI key is not configured yet. Add OPENAI_API_KEY in Render environment variables so I can answer like a real AI model."
            : "I could not reach the real AI service just now. Please try again in a moment."
        );
      } finally {
        setWaiting(false);
        input.focus();
      }
    }

    function openPanel() {
      messages = freshMessages();
      isWaitingForReply = false;
      renderMessages();
      setWaiting(false);
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
