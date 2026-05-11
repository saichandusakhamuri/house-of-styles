/**
 * Custom Studio Integration Script
 * Manages custom order creation and tracking
 */

const customState = {
  customOrders: [],
  currentCustomOrder: null,
  formData: {
    title: '',
    description: '',
    desiredDate: '',
    estimatedBudget: 0,
    referenceImages: [],
    fabricPreference: [],
    colorPreferences: [],
    measurements: {},
  },
};

// DOM Elements
const customOrdersList = document.getElementById('customOrdersList');
const CUSTOM_SELECTION_KEY = 'houseOfTailor-custom-studio-selection';
const CUSTOM_ORDER_KEY = 'houseOfTailor-custom-orders';

const defaultCustomSelection = {
  garment: 'Blazer',
  garmentBase: 'Blazer',
  occasion: 'Wedding',
  occasionBase: 'Wedding',
  fit: 'Slim Fit',
  fitBase: 'Slim Fit',
  budget: 'Rs 3000 - Rs 5000',
  budgetBase: 'Rs 3000 - Rs 5000',
};

async function initializeCustomStudio() {
  setupPrototypeCustomOptions();

  if (!customOrdersList) {
    return;
  }

  // Check if user is logged in
  if (!api.isAuthenticated()) {
    showCustomMessage('Please login to create custom orders', 'warning');
    disableCustomOptions();
    return;
  }

  try {
    await loadCustomOrders();
    setupCustomEventListeners();
    displayCustomOrders();
  } catch (error) {
    console.error('Error initializing custom studio:', error);
    showCustomMessage('Failed to load custom orders', 'error');
  }
}

function readCustomSelection() {
  try {
    const saved = localStorage.getItem(CUSTOM_SELECTION_KEY);
    return saved ? { ...defaultCustomSelection, ...JSON.parse(saved) } : { ...defaultCustomSelection };
  } catch {
    return { ...defaultCustomSelection };
  }
}

function writeCustomSelection(selection) {
  localStorage.setItem(CUSTOM_SELECTION_KEY, JSON.stringify(selection));
}

function renderPrototypeCustomSummary(selection) {
  const fields = {
    customSummaryGarment: selection.garment,
    customSummaryOccasion: selection.occasion,
    customSummaryFit: selection.fit,
    customSummaryBudget: selection.budget,
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

function renderPrototypeOptionState(selection) {
  document.querySelectorAll('[data-custom-open]').forEach((button) => {
    const group = button.getAttribute('data-custom-group');
    const value = button.getAttribute('data-custom-value');
    if (!group || !value) return;

    button.classList.toggle('active', selection[`${group}Base`] === value);
  });
}

function savePrototypeCustomOrder(selection) {
  try {
    const saved = localStorage.getItem(CUSTOM_ORDER_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    orders.unshift({
      ...selection,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(CUSTOM_ORDER_KEY, JSON.stringify(orders));
  } catch {
    // Local storage may be unavailable in strict browser modes.
  }
}

function disableCustomOptions() {
  const optionButtons = document.querySelectorAll('[data-custom-open]');
  const saveButton = document.getElementById('saveCustomStudioButton');
  optionButtons.forEach((button) => (button.disabled = true));
  if (saveButton) saveButton.disabled = true;
}

function parseBudgetAmount(budgetText) {
  const match = budgetText.match(/\d+/g);
  if (!match) return 5000;

  const numbers = match.map(Number);
  return numbers.length === 1 ? numbers[0] : Math.min(...numbers);
}

async function submitSelectionAsCustomOrder(selection) {
  const desiredDate = new Date();
  desiredDate.setDate(desiredDate.getDate() + 30);

  const formPayload = {
    title: `Custom ${selection.garment} for ${selection.occasion}`,
    description: `A ${selection.fit} ${selection.garment} tailored for ${selection.occasion} with a budget around ${selection.budget}.`,
    desiredDate: desiredDate.toISOString().split('T')[0],
    estimatedBudget: parseBudgetAmount(selection.budget),
    referenceImages: [],
    fabricPreference: [selection.garment],
    colorPreferences: ['Black', 'Gold'],
    measurements: {
      chest: '38',
      waist: '32',
      length: '40',
      shoulders: '17',
      sleeves: '24',
    },
  };

  return api.createCustomOrder(formPayload);
}

function setupPrototypeCustomOptions() {
  const optionButtons = document.querySelectorAll('[data-custom-open]');
  const saveButton = document.getElementById('saveCustomStudioButton');

  if (!optionButtons.length && !saveButton) {
    return;
  }

  const selection = readCustomSelection();
  renderPrototypeCustomSummary(selection);
  renderPrototypeOptionState(selection);

  optionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.getAttribute('data-custom-group');
      const value = button.getAttribute('data-custom-value');

      if (!group || !value) {
        return;
      }

      const nextSelection = readCustomSelection();
      nextSelection[`${group}Base`] = value;
      writeCustomSelection(nextSelection);
      window.location.href = `custom-options.html?group=${encodeURIComponent(group)}&option=${encodeURIComponent(value)}`;
    });
  });

  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      const current = readCustomSelection();

      if (!api.isAuthenticated()) {
        showCustomMessage('Please login to save custom designs', 'warning');
        return;
      }

      try {
        savePrototypeCustomOrder(current);
        await submitSelectionAsCustomOrder(current);
        await loadCustomOrders();
        displayCustomOrders();

        const message = document.getElementById('customMessage');
        if (message) {
          message.textContent = 'Your custom style has been saved and sent for review.';
        }
        showCustomMessage('Custom order created successfully', 'success');
      } catch (error) {
        console.error('Custom order creation failed:', error);
        showCustomMessage(error.message || 'Failed to create custom order', 'error');
      }
    });
  }
}

async function loadCustomOrders() {
  try {
    const response = await api.getCustomOrders({ limit: 100 });
    customState.customOrders = response.data || [];
  } catch (error) {
    console.error('Error loading custom orders:', error);
  }
}

function setupCustomEventListeners() {
  const customOrderForm = document.getElementById('customOrderForm');
  if (customOrderForm) {
    customOrderForm.addEventListener('submit', handleCustomOrderSubmit);
  }

  // Connect Socket.IO for real-time updates if not already connected
  if (!notificationManager.isConnected && api.isAuthenticated()) {
    notificationManager.connect();
    notificationManager.on('customOrderQuoted', (data) => {
      showCustomMessage(`Quote received: Rs ${data.quotedPrice}`, 'success');
      loadCustomOrders().then(() => displayCustomOrders());
    });
  }
}

function disableCustomOptions() {
  const optionButtons = document.querySelectorAll('[data-custom-open]');
  const saveButton = document.getElementById('saveCustomStudioButton');
  optionButtons.forEach((button) => (button.disabled = true));
  if (saveButton) saveButton.disabled = true;
}

async function handleCustomOrderSubmit(e) {
  e.preventDefault();

  if (!api.isAuthenticated()) {
    showCustomMessage('Please login to create custom orders', 'warning');
    return;
  }

  try {
    // Collect form data
    const formElements = customOrderForm.elements;
    const customOrderData = {
      title: formElements.title.value,
      description: formElements.description.value,
      desiredDate: formElements.desiredDate.value,
      estimatedBudget: parseFloat(formElements.estimatedBudget.value),
      referenceImages: customState.formData.referenceImages,
      fabricPreference: customState.formData.fabricPreference,
      colorPreferences: customState.formData.colorPreferences,
      measurements: {
        chest: formElements.chest?.value || '',
        waist: formElements.waist?.value || '',
        length: formElements.length?.value || '',
        shoulders: formElements.shoulders?.value || '',
        sleeves: formElements.sleeves?.value || '',
      },
    };

    // Submit to backend
    const response = await api.createCustomOrder(customOrderData);

    showCustomMessage('Custom order created successfully!', 'success');

    // Reset form
    customOrderForm.reset();
    customState.formData = {
      title: '',
      description: '',
      desiredDate: '',
      estimatedBudget: 0,
      referenceImages: [],
      fabricPreference: [],
      colorPreferences: [],
      measurements: {},
    };

    // Reload custom orders
    await loadCustomOrders();
    displayCustomOrders();
  } catch (error) {
    console.error('Error creating custom order:', error);
    showCustomMessage(error.message || 'Failed to create custom order', 'error');
  }
}

function displayCustomOrders() {
  if (!customOrdersList) return;

  if (customState.customOrders.length === 0) {
    customOrdersList.innerHTML = '<p class="empty-state">No custom orders yet. Create your first one!</p>';
    return;
  }

  customOrdersList.innerHTML = '';

  customState.customOrders.forEach((order) => {
    const card = createCustomOrderCard(order);
    customOrdersList.appendChild(card);
  });
}

function createCustomOrderCard(order) {
  const card = document.createElement('article');
  card.className = `custom-order-card status-${order.status}`;

  const statusLabel = getStatusLabel(order.status);
  const statusColor = getStatusColor(order.status);

  card.innerHTML = `
    <div class="order-header">
      <h3>${order.title}</h3>
      <span class="status-badge" style="background-color: ${statusColor};">${statusLabel}</span>
    </div>

    <div class="order-content">
      <p class="order-description">${order.description}</p>
      
      <div class="order-meta">
        <div class="meta-item">
          <span class="label">Order ID:</span>
          <span class="value">${order.customOrderNumber}</span>
        </div>
        <div class="meta-item">
          <span class="label">Desired Date:</span>
          <span class="value">${new Date(order.desiredDate).toLocaleDateString()}</span>
        </div>
        <div class="meta-item">
          <span class="label">Budget:</span>
          <span class="value">${formatPrice(order.estimatedBudget)}</span>
        </div>
      </div>

      ${
        order.quotedPrice
          ? `
        <div class="quote-section">
          <strong>Quote: ${formatPrice(order.quotedPrice)}</strong>
          <p class="quote-date">Quoted on ${new Date(order.quotedDate).toLocaleDateString()}</p>
        </div>
        `
          : ''
      }

      ${
        order.status === 'quoted'
          ? `
        <div class="order-actions">
          <button class="primary-btn small accept-quote" data-order-id="${order._id}">Accept Quote</button>
          <button class="secondary-btn small reject-quote" data-order-id="${order._id}">Reject Quote</button>
        </div>
        `
          : ''
      }

      ${
        order.communication && order.communication.length > 0
          ? `
        <div class="communication-summary">
          <strong>Latest Update:</strong>
          <p>${order.communication[order.communication.length - 1].message}</p>
        </div>
        `
          : ''
      }
    </div>

    <button class="ghost-btn full view-details" data-order-id="${order._id}">View Details</button>
  `;

  // Event listeners
  const acceptBtn = card.querySelector('.accept-quote');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => acceptCustomOrder(order._id));
  }

  const rejectBtn = card.querySelector('.reject-quote');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => rejectCustomOrder(order._id));
  }

  const viewDetailsBtn = card.querySelector('.view-details');
  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener('click', () => showCustomOrderDetails(order));
  }

  return card;
}

async function acceptCustomOrder(orderId) {
  try {
    await api.acceptCustomOrder(orderId);
    showCustomMessage('Quote accepted!', 'success');
    await loadCustomOrders();
    displayCustomOrders();
  } catch (error) {
    console.error('Error accepting quote:', error);
    showCustomMessage(error.message || 'Failed to accept quote', 'error');
  }
}

async function rejectCustomOrder(orderId) {
  const reason = prompt('Please provide a reason for rejection:');
  if (!reason) return;

  try {
    await api.rejectCustomOrder(orderId, reason);
    showCustomMessage('Quote rejected', 'info');
    await loadCustomOrders();
    displayCustomOrders();
  } catch (error) {
    console.error('Error rejecting quote:', error);
    showCustomMessage(error.message || 'Failed to reject quote', 'error');
  }
}

function showCustomOrderDetails(order) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card large">
      <div class="drawer-header">
        <div>
          <h2>${order.title}</h2>
          <p class="order-id">Order ID: ${order.customOrderNumber}</p>
        </div>
        <button class="icon-btn close-modal" aria-label="Close">X</button>
      </div>

      <div class="modal-body">
        <div class="detail-section">
          <h3>Order Details</h3>
          <p><strong>Status:</strong> ${getStatusLabel(order.status)}</p>
          <p><strong>Description:</strong> ${order.description}</p>
          <p><strong>Desired Completion Date:</strong> ${new Date(order.desiredDate).toLocaleDateString()}</p>
          <p><strong>Budget:</strong> ${formatPrice(order.estimatedBudget)}</p>
        </div>

        ${
          order.measurements
            ? `
          <div class="detail-section">
            <h3>Measurements</h3>
            <div class="measurements-grid">
              ${Object.entries(order.measurements)
                .map(
                  ([key, value]) =>
                    value ? `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>` : ''
                )
                .join('')}
            </div>
          </div>
          `
            : ''
        }

        ${
          order.quotedPrice
            ? `
          <div class="detail-section quote-info">
            <h3>Quote</h3>
            <p><strong>Quoted Price:</strong> ${formatPrice(order.quotedPrice)}</p>
            <p><strong>Advance Required:</strong> ${formatPrice(order.advanceAmount)}</p>
            <p><strong>Remaining:</strong> ${formatPrice(order.remainingAmount)}</p>
          </div>
          `
            : ''
        }

        ${
          order.communication && order.communication.length > 0
            ? `
          <div class="detail-section">
            <h3>Communication History</h3>
            <div class="communication-thread">
              ${order.communication
                .map(
                  (msg) => `
                <div class="message ${msg.senderRole}">
                  <strong>${msg.senderRole.toUpperCase()}</strong>
                  <p>${msg.message}</p>
                  <small>${new Date(msg.createdAt).toLocaleString()}</small>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
          `
            : ''
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => modal.remove());
}

function getStatusLabel(status) {
  const labels = {
    inquiry: 'Inquiry Sent',
    quoted: 'Quote Received',
    accepted: 'In Progress',
    'in-progress': 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

function getStatusColor(status) {
  const colors = {
    inquiry: '#6B7280',
    quoted: '#F59E0B',
    accepted: '#3B82F6',
    'in-progress': '#3B82F6',
    completed: '#10B981',
    rejected: '#EF4444',
    cancelled: '#6B7280',
  };
  return colors[status] || '#6B7280';
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u20B9/g, 'Rs ');
}

function showCustomMessage(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeCustomStudio);
