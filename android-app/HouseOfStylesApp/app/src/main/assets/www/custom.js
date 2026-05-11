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
};

function readSelection() {
  try {
    const saved = localStorage.getItem(customStorageKeys.selection);
    return saved ? JSON.parse(saved) : { ...defaultSelection };
  } catch {
    return { ...defaultSelection };
  }
}

function persistSelection() {
  localStorage.setItem(customStorageKeys.selection, JSON.stringify(customState.selection));
}

function saveCustomSelections() {
  try {
    const existing = localStorage.getItem(customStorageKeys.custom);
    const customOrders = existing ? JSON.parse(existing) : [];
    customOrders.unshift({
      ...customState.selection,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(customStorageKeys.custom, JSON.stringify(customOrders));
  } catch {
    // Keep the page usable even if storage is unavailable.
  }
}

function renderCustomSummary() {
  document.getElementById("customSummaryGarment").textContent = customState.selection.garment;
  document.getElementById("customSummaryOccasion").textContent = customState.selection.occasion;
  document.getElementById("customSummaryFit").textContent = customState.selection.fit;
  document.getElementById("customSummaryBudget").textContent = customState.selection.budget;
}

function renderCustomBaseSelectionState() {
  document.querySelectorAll("[data-custom-open]").forEach((button) => {
    const group = button.getAttribute("data-custom-group");
    const value = button.getAttribute("data-custom-value");
    const baseKey = `${group}Base`;
    button.classList.toggle("active", customState.selection[baseKey] === value);
  });
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

  document.getElementById("saveCustomStudioButton").addEventListener("click", () => {
    persistSelection();
    saveCustomSelections();
    document.getElementById("customMessage").textContent =
      "Your custom style options have been saved. Next this can connect to tailoring and checkout.";
  });

  renderCustomSummary();
  renderCustomBaseSelectionState();
}

bindCustomStudioPage();
