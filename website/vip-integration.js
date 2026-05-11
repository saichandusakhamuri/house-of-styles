/**
 * VIP Club Integration Script
 * Manages membership tier display and upgrade functionality
 */

const vipState = {
  membershipTiers: [],
  userMembership: null,
  userProfile: null,
};

// DOM Elements
const tierCardsContainer = document.getElementById('membershipTiersContainer') || document.querySelector('.tier-grid');

// Payment Modal Elements
const paymentModal = document.getElementById('paymentModal');
const closePaymentModalBtn = document.getElementById('closePaymentModal');
const stripePaymentBtn = document.getElementById('stripePaymentBtn');
const upiPaymentBtn = document.getElementById('upiPaymentBtn');
const stripePaymentForm = document.getElementById('stripePaymentForm');
const upiPaymentForm = document.getElementById('upiPaymentForm');
const upiIdInput = document.getElementById('upiIdInput');
const submitUPIPaymentBtn = document.getElementById('submitUPIPayment');

// Stripe Initialization
let stripe;
try {
  stripe = Stripe('pk_test_51O7YtSCDXzG4U1fWjR6v7Yx8p9q0r1s2t3u4v5w6x7y8z');
} catch (e) {
  console.warn('Stripe not loaded');
}

let stripeElements;
let pendingUpgradeData = null;

const MOCK_VIP_TIERS = [
  {
    _id: "t1",
    name: "Silver",
    description: "Entry VIP access with shopping discounts and early previews.",
    monthlyPrice: 299,
    annualPrice: 2499,
    discountPercentage: 5,
    features: ["5% Storewide Discount", "Early Access to Drops", "Standard Custom Support"]
  },
  {
    _id: "t2",
    name: "Gold",
    description: "Premium rewards with higher discounts and faster tailoring.",
    monthlyPrice: 599,
    annualPrice: 4999,
    discountPercentage: 10,
    features: ["10% Storewide Discount", "48h Early Access", "Priority Custom Stitching", "Free Shipping"]
  },
  {
    _id: "t3",
    name: "Platinum",
    description: "Elite fashion status with maximum benefits and personal styling.",
    monthlyPrice: 999,
    annualPrice: 8999,
    discountPercentage: 15,
    features: ["15% Storewide Discount", "Exclusive Collection Access", "Fastest Delivery Route", "Personal Stylist Consult"]
  }
];

async function initializeVIP() {
  // Setup payment listeners
  if (closePaymentModalBtn) {
    closePaymentModalBtn.onclick = () => paymentModal.hidden = true;
    stripePaymentBtn.onclick = handleStripePayment;
    upiPaymentBtn.onclick = handleUPIPayment;
  }

  try {
    // Load membership tiers
    try {
      const tiersResponse = await api.getMembershipTiers();
      vipState.membershipTiers = tiersResponse.data || MOCK_VIP_TIERS;
    } catch (e) {
      vipState.membershipTiers = MOCK_VIP_TIERS;
    }

    // Load user membership info
    try {
      const membershipResponse = await api.getUserMembership();
      vipState.userMembership = membershipResponse.data;
    } catch (e) {
      console.warn("Could not load real membership, staying as guest.");
    }

    // Load user profile
    try {
      const profileResponse = await api.getUserProfile();
      vipState.userProfile = profileResponse.data;
    } catch (e) {
      // Ignore
    }

    // Render membership tiers
    renderMembershipTiers();

    // Display current membership and personalized discounts
    displayCurrentMembership();
    displayPersonalizedDiscounts();
  } catch (error) {
    console.error('Error initializing VIP:', error);
    showVIPMessage('Failed to load membership information', 'error');
  }
}

function renderMembershipTiers() {
  if (!tierCardsContainer) return;

  tierCardsContainer.innerHTML = '';

  vipState.membershipTiers.forEach((tier) => {
    const tierCard = createTierCard(tier);
    tierCardsContainer.appendChild(tierCard);
  });
}

function createTierCard(tier) {
  const card = document.createElement('article');
  card.className = 'tier-card';
  const isCurrentTier = vipState.userMembership?.membershipTier?._id === tier._id;
  const isCurrentTierByName = vipState.userMembership?.membershipTier?.name?.toLowerCase() === tier.name.toLowerCase();
  
  if (isCurrentTier || isCurrentTierByName) {
    card.classList.add('active');
  }
  
  card.innerHTML = `
    <div class="tier-badge">${tier.name}</div>
    <h3>${tier.name} Membership</h3>
    <p class="tier-description">${tier.description || 'Premium membership benefits'}</p>
    
    <div class="tier-benefits">
      <strong>Benefits:</strong>
      <ul>
        ${tier.features.map((feature) => `<li>✓ ${feature}</li>`).join('')}
      </ul>
    </div>

    <div class="tier-pricing">
      <div class="price-option">
        <span class="period">Monthly</span>
        <strong class="amount">${formatPrice(tier.monthlyPrice)}</strong>
      </div>
      <div class="price-option">
        <span class="period">Annual</span>
        <strong class="amount">${formatPrice(tier.annualPrice)}</strong>
      </div>
      <strong class="discount-badge">Save ${Math.round((1 - tier.monthlyPrice * 12 / tier.annualPrice) * 100)}% with annual</strong>
    </div>

    <div class="tier-discount">
      <span class="discount-label">Discount on orders:</span>
      <strong class="discount-percentage">${tier.discountPercentage}% off</strong>
    </div>

    ${
      isCurrentTier || isCurrentTierByName
        ? '<button class="secondary-btn full" disabled>Current Plan</button>'
        : `
          <div class="tier-actions">
            <button class="primary-btn full upgrade-btn" data-tier-id="${tier._id}" data-tier-name="${tier.name}">
              Choose ${tier.name}
            </button>
          </div>
          `
    }
  `;

  // Add upgrade event listener
  const upgradeBtn = card.querySelector('.upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => showUpgradeModal(tier));
  }

  return card;
}

function displayPersonalizedDiscounts() {
  if (!api.isAuthenticated() || !vipState.userMembership?.membershipTier) {
    // Show default discounts for guest users
    const discountMap = {
      'formalDiscount': '10%',
      'weddingDiscount': '12%',
      'partyDiscount': '8%',
      'casualDiscount': '6%'
    };
    Object.entries(discountMap).forEach(([id, value]) => {
      const elem = document.getElementById(id);
      if (elem) elem.textContent = value + ' OFF';
    });
    return;
  }

  // Show user's tier discounts
  const tier = vipState.userMembership.membershipTier;
  const discountPercent = tier.discountPercentage || 10;
  const discountText = `${discountPercent}% OFF`;

  const discountMap = {
    'formalDiscount': discountText,
    'weddingDiscount': discountText,
    'partyDiscount': discountText,
    'casualDiscount': discountText
  };

  Object.entries(discountMap).forEach(([id, value]) => {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = value;
  });
}

function displayCurrentMembership() {
  const customerNameElem = document.getElementById('customerName');
  const customerEmailElem = document.getElementById('customerEmail');
  const tierNameElem = document.getElementById('tierName');
  const tierDescriptionElem = document.getElementById('tierDescription');
  const vipSigninPrompt = document.getElementById('vipSigninPrompt');

  if (!customerNameElem || !customerEmailElem || !tierNameElem || !tierDescriptionElem) {
    return;
  }

  if (!api.isAuthenticated() || !vipState.userMembership?.membershipTier) {
    customerNameElem.textContent = 'Guest User';
    customerEmailElem.textContent = 'Please sign in to unlock your VIP pricing.';
    tierNameElem.textContent = 'Silver Member';
    tierDescriptionElem.textContent = 'Entry VIP access with shopping discounts and early previews.';
    if (vipSigninPrompt) vipSigninPrompt.hidden = false;
    return;
  }

  const tier = vipState.userMembership.membershipTier;
  customerNameElem.textContent = `${vipState.userProfile?.firstName || 'Valued'} ${vipState.userProfile?.lastName || 'Customer'}`.trim();
  customerEmailElem.textContent = vipState.userProfile?.email || 'Registered customer';
  tierNameElem.textContent = `${tier.name} Member`;
  tierDescriptionElem.textContent = tier.description || 'VIP access and discounts for your membership tier.';
  if (vipSigninPrompt) vipSigninPrompt.hidden = true;
}

function showUpgradeModal(tier) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="drawer-header">
        <div>
          <h2>Upgrade to ${tier.name}</h2>
        </div>
        <button class="icon-btn close-modal" aria-label="Close">X</button>
      </div>
      <div class="modal-body">
        <p class="tier-description">${tier.description}</p>
        <div class="upgrade-options">
          <div class="option-card">
            <h4>Monthly</h4>
            <strong class="amount">${formatPrice(tier.monthlyPrice)}/month</strong>
            <button class="primary-btn full upgrade-action" data-duration="monthly">
              Upgrade Monthly
            </button>
          </div>
          <div class="option-card highlight">
            <h4>Annual (Save ${Math.round((1 - tier.monthlyPrice * 12 / tier.annualPrice) * 100)}%)</h4>
            <strong class="amount">${formatPrice(tier.annualPrice)}/year</strong>
            <button class="primary-btn full upgrade-action" data-duration="annual">
              Upgrade Annual
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => modal.remove());

  const upgradeButtons = modal.querySelectorAll('.upgrade-action');
  upgradeButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const duration = btn.dataset.duration;
      await performUpgrade(tier.name, duration);
      modal.remove();
    });
  });
}

async function performUpgrade(tierName, duration) {
  try {
    // In a real app, you'd create an "Order" or "Subscription" record first
    // For this demo, we'll store the pending upgrade and show the payment modal
    pendingUpgradeData = { tierName, duration };
    paymentModal.hidden = false;
    showVIPMessage(`Proceeding to payment for ${tierName} ${duration} plan`, 'info');
  } catch (error) {
    console.error('Upgrade initiation error:', error);
    showVIPMessage(error.message || 'Upgrade failed', 'error');
  }
}

// ==================== PAYMENT HANDLING ====================

async function handleStripePayment() {
  stripePaymentForm.hidden = false;
  upiPaymentForm.hidden = true;

  try {
    // Simulated payment intent for membership
    // In reality, you'd have an endpoint POST /api/payments/create-membership-intent
    const clientSecret = 'pi_membership_mock_secret_' + Date.now();

    // For demo, if Stripe isn't fully configured, we'll just simulate success
    if (!stripe) {
      setTimeout(() => confirmUpgrade(), 2000);
      return;
    }

    const appearance = { theme: 'night', variables: { colorPrimary: '#d9c4a3' } };
    stripeElements = stripe.elements({ appearance, clientSecret });

    // Note: This won't work without a real clientSecret from Stripe
    // For this demo, we'll simulate the payment flow
    document.getElementById('submitStripePayment').onclick = async () => {
      showVIPMessage('Processing payment...', 'info');
      setTimeout(() => confirmUpgrade(), 2000);
    };
  } catch (error) {
    console.error('Stripe error:', error);
  }
}

async function handleUPIPayment() {
  stripePaymentForm.hidden = true;
  upiPaymentForm.hidden = false;

  submitUPIPaymentBtn.onclick = async () => {
    const upiId = upiIdInput.value;
    if (!upiId) {
      showVIPMessage('Please enter a valid UPI ID', 'warning');
      return;
    }

    showVIPMessage('UPI request sent! Please check your UPI app.', 'info');
    setTimeout(() => confirmUpgrade(), 3000);
  };
}

async function confirmUpgrade() {
  if (!pendingUpgradeData) return;

  try {
    await api.upgradeMembership(pendingUpgradeData.tierName, pendingUpgradeData.duration);
    showVIPMessage(`Successfully upgraded to ${pendingUpgradeData.tierName}!`, 'success');
    
    paymentModal.hidden = true;
    pendingUpgradeData = null;

    // Reload membership info
    const membershipResponse = await api.getUserMembership();
    vipState.userMembership = membershipResponse.data;
    
    // Re-render
    renderMembershipTiers();
    displayCurrentMembership();
    displayPersonalizedDiscounts();
  } catch (error) {
    showVIPMessage('Failed to confirm membership upgrade', 'error');
  }
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

function showVIPMessage(message, type = 'info') {
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
document.addEventListener('DOMContentLoaded', initializeVIP);
