const customStorageKeys = {
  custom: "houseOfTailor-custom-orders",
  selection: "houseOfTailor-custom-studio-selection",
};

const defaultSelection = {
  garment: "Blazer",
  garmentBase: "Blazer",
  occasion: "Wedding",
  occasionBase: "Wedding",
  fit: "Slim Fit",
  fitBase: "Slim Fit",
  budget: "Rs 3000 - Rs 5000",
  budgetBase: "Rs 3000 - Rs 5000",
};

const customState = {
  selection: readSelection(),
  customOrders: loadCustomOrders(),
};

function readSelection() {
  try {
    const saved = localStorage.getItem(customStorageKeys.selection);
    return saved ? { ...defaultSelection, ...JSON.parse(saved) } : { ...defaultSelection };
  } catch {
    return { ...defaultSelection };
  }
}

function persistSelection() {
  try {
    localStorage.setItem(customStorageKeys.selection, JSON.stringify(customState.selection));
  } catch {
    // Keep the page usable even if storage is unavailable.
  }
}

function loadCustomOrders() {
  try {
    const existing = localStorage.getItem(customStorageKeys.custom);
    const customOrders = existing ? JSON.parse(existing) : [];
    return Array.isArray(customOrders) ? customOrders.map(normalizeCustomOrder) : [];
  } catch {
    return [];
  }
}

function persistCustomOrders() {
  try {
    localStorage.setItem(customStorageKeys.custom, JSON.stringify(customState.customOrders));
  } catch {
    // Keep the page usable even if storage is unavailable.
  }
}

function normalizeCustomOrder(order) {
  const selection = {
    ...defaultSelection,
    ...order,
  };
  const createdAt = selection.createdAt || order.createdAt || new Date().toISOString();

  return {
    id: order.id || order.customOrderNumber || `custom-${new Date(createdAt).getTime()}`,
    customOrderNumber:
      order.customOrderNumber || `CS-${String(new Date(createdAt).getTime()).slice(-6)}`,
    title: order.title || `Custom ${selection.garment} for ${selection.occasion}`,
    description:
      order.description ||
      `A ${selection.fit} ${selection.garment} tailored for ${selection.occasion} with a ${selection.budget} budget.`,
    status: order.status || "saved",
    statusLabel: order.statusLabel || "Saved locally",
    garment: selection.garment,
    garmentBase: selection.garmentBase,
    occasion: selection.occasion,
    occasionBase: selection.occasionBase,
    fit: selection.fit,
    fitBase: selection.fitBase,
    budget: selection.budget,
    budgetBase: selection.budgetBase,
    createdAt,
  };
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showCustomMessage(message) {
  const messageElement = document.getElementById("customMessage");
  if (messageElement) {
    messageElement.textContent = message;
  }
}

function renderCustomSummary() {
  const garment = document.getElementById("customSummaryGarment");
  const occasion = document.getElementById("customSummaryOccasion");
  const fit = document.getElementById("customSummaryFit");
  const budget = document.getElementById("customSummaryBudget");

  if (!garment || !occasion || !fit || !budget) {
    return;
  }

  garment.textContent = customState.selection.garment;
  occasion.textContent = customState.selection.occasion;
  fit.textContent = customState.selection.fit;
  budget.textContent = customState.selection.budget;
}

function renderCustomBaseSelectionState() {
  document.querySelectorAll("[data-custom-open]").forEach((button) => {
    const group = button.getAttribute("data-custom-group");
    const value = button.getAttribute("data-custom-value");
    const baseKey = `${group}Base`;
    button.classList.toggle("active", customState.selection[baseKey] === value);
  });
}

function renderCustomOrders() {
  const list = document.getElementById("customOrdersList");
  if (!list) {
    return;
  }

  if (!customState.customOrders.length) {
    list.innerHTML =
      '<p class="empty-state">No custom styles saved yet. Choose your options and save one to see it here.</p>';
    return;
  }

  list.innerHTML = "";
  customState.customOrders.forEach((order) => {
    list.appendChild(createCustomOrderCard(order));
  });
}

function createCustomOrderCard(order) {
  const card = document.createElement("article");
  card.className = "custom-order-card";

  card.innerHTML = `
    <div class="custom-order-header">
      <div>
        <p class="eyebrow">Custom Style</p>
        <h3>${escapeHTML(order.title)}</h3>
      </div>
      <span class="status-badge">${escapeHTML(order.statusLabel || "Saved locally")}</span>
    </div>

    <p class="custom-order-description">${escapeHTML(order.description)}</p>

    <div class="custom-order-meta">
      <div>
        <span>Garment</span>
        <strong>${escapeHTML(order.garment)}</strong>
      </div>
      <div>
        <span>Occasion</span>
        <strong>${escapeHTML(order.occasion)}</strong>
      </div>
      <div>
        <span>Fit</span>
        <strong>${escapeHTML(order.fit)}</strong>
      </div>
      <div>
        <span>Budget</span>
        <strong>${escapeHTML(order.budget)}</strong>
      </div>
    </div>

    <div class="custom-order-footer">
      <small>Saved ${new Date(order.createdAt).toLocaleDateString()}</small>
      <small>${escapeHTML(order.customOrderNumber)}</small>
    </div>

    <div class="custom-order-actions">
      <button class="secondary-btn small reuse-order-btn" type="button" data-order-id="${escapeHTML(order.id)}">Reuse style</button>
      <button class="ghost-btn small delete-order-btn" type="button" data-order-id="${escapeHTML(order.id)}">Delete</button>
    </div>
  `;

  card.querySelector(".reuse-order-btn").addEventListener("click", () => {
    reuseCustomOrder(order.id);
  });

  card.querySelector(".delete-order-btn").addEventListener("click", () => {
    deleteCustomOrder(order.id);
  });

  return card;
}

function reuseCustomOrder(orderId) {
  const order = customState.customOrders.find((item) => item.id === orderId);
  if (!order) {
    return;
  }

  customState.selection = {
    ...defaultSelection,
    garment: order.garment,
    garmentBase: order.garmentBase || order.garment,
    occasion: order.occasion,
    occasionBase: order.occasionBase || order.occasion,
    fit: order.fit,
    fitBase: order.fitBase || order.fit,
    budget: order.budget,
    budgetBase: order.budgetBase || order.budget,
  };

  persistSelection();
  renderCustomSummary();
  renderCustomBaseSelectionState();
  showCustomMessage(`Reused ${order.title}. You can refine it further now.`);
}

function deleteCustomOrder(orderId) {
  customState.customOrders = customState.customOrders.filter((order) => order.id !== orderId);
  persistCustomOrders();
  renderCustomOrders();
  showCustomMessage("Custom style removed from this device.");
}

function saveCustomSelections() {
  const selection = readSelection();
  const now = new Date().toISOString();

  customState.selection = selection;
  customState.customOrders.unshift(
    normalizeCustomOrder({
      ...selection,
      createdAt: now,
      status: "saved",
      statusLabel: "Saved locally",
    })
  );
  persistCustomOrders();
  renderCustomOrders();
}

function bindCustomStudioPage() {
  document.querySelectorAll("[data-custom-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.getAttribute("data-custom-group");
      const value = button.getAttribute("data-custom-value");

      if (!group || !value) {
        return;
      }

      window.location.href = `custom-options.html?group=${encodeURIComponent(group)}&option=${encodeURIComponent(value)}`;
    });
  });

  const saveButton = document.getElementById("saveCustomStudioButton");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      persistSelection();
      saveCustomSelections();
      showCustomMessage("Your custom style has been saved locally on this device.");
    });
  }

  renderCustomSummary();
  renderCustomBaseSelectionState();
  renderCustomOrders();
}

bindCustomStudioPage();
