(function () {
  const storageKey = "houseOfStyles-omniagent-chat";

  const quickPrompts = [
    "Help me choose an outfit",
    "Explain VIP benefits",
    "Custom tailoring help",
  ];

  const starterMessages = [
    {
      role: "bot",
      text:
        "Hi, I am OmniAgent. I can help with shopping choices, VIP benefits, custom styling, planning, writing, and quick problem solving while you keep browsing.",
    },
  ];

  function loadMessages() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) && saved.length ? saved : starterMessages;
    } catch {
      return starterMessages;
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-24)));
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

  function buildReply(message) {
    const text = message.toLowerCase();
    const context = getPageContext();

    if (text.includes("vip") || text.includes("member") || text.includes("benefit")) {
      return "For VIP help: compare the tiers, choose the plan that matches how often you shop, then use the VIP page to activate interest or membership. I can also help you decide which tier fits your budget.";
    }

    if (text.includes("custom") || text.includes("tailor") || text.includes("stitch")) {
      return "For custom tailoring: start with garment type, occasion, fit, and budget. Then share any style notes like color, fabric, sleeve, length, or event date so the studio has a clear brief.";
    }

    if (text.includes("outfit") || text.includes("style") || text.includes("wear") || text.includes("dress")) {
      return "Tell me the occasion, budget, preferred color, and whether you want formal, wedding, party, or casual wear. I will narrow it into a practical outfit recommendation.";
    }

    if (text.includes("plan") || text.includes("strategy") || text.includes("workflow")) {
      return "I can help build a plan. Share the goal, deadline, constraints, and what a successful result looks like. I will break it into steps and point out risks.";
    }

    if (text.includes("write") || text.includes("content") || text.includes("caption")) {
      return "Send the rough idea, audience, and tone. I can turn it into clean website copy, product text, captions, messages, or a short customer-facing response.";
    }

    return `I am ready on the ${context}. Ask me for product guidance, VIP help, custom styling, writing, planning, troubleshooting, or decision support, and I will keep the answer focused.`;
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

    let messages = loadMessages();

    const widget = document.createElement("section");
    widget.className = "agent-widget";
    widget.setAttribute("aria-label", "OmniAgent chatbot");
    widget.innerHTML = `
      <div class="agent-panel" id="agentPanel" hidden>
        <header class="agent-header">
          <div class="agent-title">
            <span class="agent-avatar">AI</span>
            <span>
              <strong>OmniAgent</strong>
              <small>Ask while you browse</small>
            </span>
          </div>
          <button class="agent-close" type="button" aria-label="Close OmniAgent">X</button>
        </header>
        <div class="agent-messages" id="agentMessages" aria-live="polite"></div>
        <div class="agent-quick-actions" aria-label="Suggested prompts"></div>
        <form class="agent-form">
          <input type="text" name="message" placeholder="Ask OmniAgent..." autocomplete="off" />
          <button class="agent-send" type="submit">Send</button>
        </form>
      </div>
      <button class="agent-launcher" type="button" aria-label="Open OmniAgent chatbot" aria-expanded="false" aria-controls="agentPanel">AI</button>
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
      saveMessages(messages);
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
      window.setTimeout(() => addMessage("bot", buildReply(cleanText)), 220);
    }

    function openPanel() {
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
