/**
 * House of Styles Frontend Integration Script
 * Integrates all frontend functionality with the backend API
 */

// Configuration
const API_BASE_URL = window.HOS_CONFIG?.apiBaseUrl || 'http://localhost:5001/api';
const STORAGE_KEYS = {
  cart: 'houseOfTailor-cart',
  favorites: 'houseOfTailor-favorites',
  orders: 'houseOfTailor-orders',
  customOrders: 'houseOfTailor-custom-orders',
  token: 'houseOfTailor-token',
  user: 'houseOfTailor-user',
};

// State Management
const appState = {
  selectedCategory: 'All',
  selectedPrice: 'all',
  selectedAudience: 'All',
  search: '',
  sort: 'featured',
  cart: loadStorage(STORAGE_KEYS.cart, []),
  favorites: loadStorage(STORAGE_KEYS.favorites, []),
  orders: loadStorage(STORAGE_KEYS.orders, []),
  products: [],
  siteContent: null,
  currentUser: api.getUser(),
  membershipTiers: [],
  userMembership: null,
};

// DOM Elements
const productGrid = document.getElementById('productGrid');
const productTemplate = document.getElementById('productCardTemplate');
const resultsText = document.getElementById('resultsText');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const favoritesCount = document.getElementById('favoritesCount');
const cartTotal = document.getElementById('cartTotal');
const cartDrawer = document.getElementById('cartDrawer');
const favoritesDrawer = document.getElementById('favoritesDrawer');
const favoriteItems = document.getElementById('favoriteItems');
const favoritesTotal = document.getElementById('favoritesTotal');
const overlay = document.getElementById('overlay');
const closeCartButton = document.getElementById('closeCartButton');
const closeFavoritesButton = document.getElementById('closeFavoritesButton');
const browseFavoritesButton = document.getElementById('browseFavoritesButton');
const authModal = document.getElementById('authModal');
const customerSignupForm = document.getElementById('customerSignupForm');
const customerLoginForm = document.getElementById('customerLoginForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const backToLoginButton = document.getElementById('backToLoginButton');
const passwordResetMessage = document.getElementById('passwordResetMessage');
const openAuthModalBtn = document.getElementById('openAuthModal');
const closeAuthModalBtn = document.getElementById('closeAuthModal');
const accountModal = document.getElementById('accountModal');
const accountModalTitle = document.getElementById('accountModalTitle');
const accountModalText = document.getElementById('accountModalText');
const profileSummary = document.getElementById('profileSummary');
const closeAccountModalBtn = document.getElementById('closeAccountModal');
const confirmAccountModalBtn = document.getElementById('confirmAccountModal');
const paymentModal = document.getElementById('paymentModal');
const closePaymentModalBtn = document.getElementById('closePaymentModal');
const checkoutButton = document.getElementById('checkoutButton');
const creditCardPaymentBtn = document.getElementById('creditCardPaymentBtn');
const debitCardPaymentBtn = document.getElementById('debitCardPaymentBtn');
const netbankingPaymentBtn = document.getElementById('netbankingPaymentBtn');
const gatewayUPIPaymentBtn = document.getElementById('gatewayUPIPaymentBtn');
const upiPaymentBtn = document.getElementById('upiPaymentBtn');
const openGatewayCheckoutButton = document.getElementById('openGatewayCheckoutButton');
const gatewayPaymentForm = document.getElementById('gatewayPaymentForm');
const gatewayMethodValue = document.getElementById('gatewayMethodValue');
const gatewayAmountValue = document.getElementById('gatewayAmountValue');
const gatewayReferenceValue = document.getElementById('gatewayReferenceValue');
const upiPaymentForm = document.getElementById('upiPaymentForm');
const paymentMessage = document.getElementById('paymentMessage');
const upiIdInput = document.getElementById('upiIdInput');
const submitUPIPaymentBtn = document.getElementById('submitUPIPayment');

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryPills = document.querySelectorAll('.shop-category-strip .pill');

// Stripe is only enabled when a real publishable key is provided in runtime config.
let stripe;
try {
  if (window.HOS_CONFIG?.stripePublicKey) {
    stripe = Stripe(window.HOS_CONFIG.stripePublicKey);
  }
} catch (e) {
  console.warn('Stripe not loaded');
}

let stripeElements;
let currentOrderId;
let pendingPaymentContext = null;

// ==================== INITIALIZATION ====================

async function initializeApp() {
  await loadSiteContent();

  // Load products from backend
  await loadProducts();

  // Load membership tiers
  await loadMembershipTiers();
  updateHomepageHighlights();

  // Load user membership if logged in
  if (api.isAuthenticated()) {
    await loadUserMembership();
    updateAuthUI();
  }

  // Setup event listeners
  setupEventListeners();

  // Setup Socket.IO for real-time updates
  if (api.isAuthenticated()) {
    notificationManager.connect();
    setupNotificationListeners();
  }

  // Render initial products
  renderProducts();

  // Update cart and favorites display
  updateCartDisplay();
  updateFavoritesDisplay();
}

async function loadSiteContent() {
  try {
    const response = await api.request('/site-content');
    appState.siteContent = response.data || null;
    applySiteContent();
  } catch (error) {
    console.warn('Site content API failed', error);
  }
}

function applySiteContent() {
  const content = appState.siteContent;
  if (!content) return;

  if (window.location.pathname.includes('vip.html') || document.querySelector('.vip-page')) {
    const vip = content.vip || {};
    const heroEyebrow = document.querySelector('.vip-hero .eyebrow');
    const heroTitle = document.querySelector('.vip-hero h1');
    const heroText = document.querySelector('.vip-hero .hero-text');
    const cardTitle = document.querySelector('.vip-hero-card h2');
    const cardText = document.querySelector('.vip-hero-card p');
    const statusHeading = document.querySelector('.vip-status-section .section-heading h2');
    const statusEyebrow = document.querySelector('.vip-status-section .section-heading .eyebrow');
    const signedOutTitle = document.querySelector('#vipSigninPrompt h3');
    const signedOutText = document.querySelector('#vipSigninPrompt .hero-text');
    const tiersTitle = document.querySelector('.vip-tiers-section .section-heading h2');
    if (heroEyebrow) heroEyebrow.textContent = vip.eyebrow || heroEyebrow.textContent;
    if (heroTitle) heroTitle.textContent = vip.title || heroTitle.textContent;
    if (heroText) heroText.textContent = vip.summary || heroText.textContent;
    if (cardTitle) cardTitle.textContent = vip.cardTitle || cardTitle.textContent;
    if (cardText) cardText.textContent = vip.cardText || cardText.textContent;
    if (statusHeading) statusHeading.textContent = vip.statusTitle || statusHeading.textContent;
    if (statusEyebrow) statusEyebrow.textContent = vip.statusEyebrow || statusEyebrow.textContent;
    if (signedOutTitle) signedOutTitle.textContent = vip.signedOutTitle || signedOutTitle.textContent;
    if (signedOutText) signedOutText.textContent = vip.signedOutText || signedOutText.textContent;
    if (tiersTitle) tiersTitle.textContent = vip.tiersTitle || tiersTitle.textContent;
  }

  if (window.location.pathname.includes('custom.html') || document.querySelector('.custom-section')) {
    const custom = content.custom || {};
    const heroEyebrow = document.querySelector('.vip-hero .eyebrow');
    const heroTitle = document.querySelector('.vip-hero h1');
    const heroText = document.querySelector('.vip-hero .hero-text');
    const cardTitle = document.querySelector('.vip-hero-card h2');
    const cardText = document.querySelector('.vip-hero-card p');
    const sectionEyebrow = document.querySelector('.custom-section .section-heading .eyebrow');
    const sectionNote = document.querySelector('.custom-section-note');
    const steps = document.querySelectorAll('.custom-aside .process-card');
    if (heroEyebrow) heroEyebrow.textContent = custom.eyebrow || heroEyebrow.textContent;
    if (heroTitle) heroTitle.textContent = custom.title || heroTitle.textContent;
    if (heroText) heroText.textContent = custom.summary || heroText.textContent;
    if (cardTitle) cardTitle.textContent = custom.cardTitle || cardTitle.textContent;
    if (cardText) cardText.textContent = custom.cardText || cardText.textContent;
    if (sectionEyebrow) sectionEyebrow.textContent = custom.sectionEyebrow || sectionEyebrow.textContent;
    if (sectionNote) sectionNote.textContent = custom.sectionNote || sectionNote.textContent;
    custom.processSteps?.forEach((step, index) => {
      const card = steps[index];
      if (!card) return;
      const title = card.querySelector('h3');
      const text = card.querySelector('p');
      if (title) title.textContent = step.title;
      if (text) text.textContent = step.text;
    });
  }

  if (document.querySelector('.store-hero')) {
    const home = content.homepage || {};
    const eyebrow = document.querySelector('.store-hero .eyebrow');
    const title = document.querySelector('.store-hero h1');
    const summary = document.querySelector('.store-hero .hero-text');
    const actions = document.querySelectorAll('.store-hero .hero-actions a');
    const heroStats = document.querySelectorAll('.hero-stats article');
    const heroCards = document.querySelectorAll('.store-hero-visuals .hero-display-card');
    const marketPills = document.querySelectorAll('.market-strip .market-pill');
    const panels = document.querySelectorAll('.homepage-panels .homepage-panel');
    const runwayCards = document.querySelectorAll('.feature-runway-card');

    if (eyebrow) eyebrow.textContent = home.eyebrow || eyebrow.textContent;
    if (title) title.textContent = home.title || title.textContent;
    if (summary) summary.textContent = home.summary || summary.textContent;
    if (actions[0] && home.actions?.[0]) {
      actions[0].textContent = home.actions[0].label;
      actions[0].setAttribute('href', home.actions[0].href);
    }
    if (actions[1] && home.actions?.[1]) {
      actions[1].textContent = home.actions[1].label;
      actions[1].setAttribute('href', home.actions[1].href);
    }
    home.stats?.forEach((stat, index) => {
      const card = heroStats[index];
      if (!card) return;
      const strong = card.querySelector('strong');
      const span = card.querySelector('span');
      if (strong) strong.textContent = stat.label;
      if (span) span.textContent = stat.detail;
    });
    home.heroCards?.forEach((cardData, index) => {
      const card = heroCards[index];
      if (!card) return;
      const tag = card.querySelector('.tag');
      const heading = card.querySelector('h3');
      if (tag) tag.textContent = cardData.tag;
      if (heading) heading.textContent = cardData.title;
    });
    home.pills?.forEach((pillText, index) => {
      if (marketPills[index]) marketPills[index].textContent = pillText;
    });
    home.panels?.forEach((panelData, index) => {
      const panel = panels[index];
      if (!panel) return;
      const eyebrowEl = panel.querySelector('.eyebrow');
      const titleEl = panel.querySelector('h3');
      if (eyebrowEl) eyebrowEl.textContent = panelData.eyebrow;
      if (titleEl) titleEl.textContent = panelData.title;
    });
    home.features?.forEach((feature, index) => {
      const card = runwayCards[index];
      if (!card) return;
      const titleEl = card.querySelector('h3');
      const textEl = card.querySelector('p');
      if (titleEl) titleEl.textContent = feature.title;
      if (textEl) textEl.textContent = feature.text;
    });
  }
}

// ==================== PRODUCT MANAGEMENT ====================

function normalizeProduct(product) {
  const basePrice = Number(product.basePrice || product.price || product.finalPrice || 0);
  const finalPrice = Number(product.finalPrice || basePrice);

  return {
    ...product,
    _id: String(product._id || product.id),
    basePrice,
    finalPrice,
    sizes: product.sizes?.length ? product.sizes : ['One Size'],
    audience: product.audience || 'Everyday',
    category: product.category || 'Casual Wear',
    discountPercentage: product.discountPercentage || 0,
    palette: product.palette || 'linear-gradient(135deg, #d9c4a3, #8b5a36)',
  };
}

async function loadProducts(options = {}) {
  try {
    const response = await api.getProducts({
      limit: 100,
      ...options,
    });

    const apiProducts = Array.isArray(response.data) ? response.data : [];
    appState.products = apiProducts.map(normalizeProduct);
    normalizeStoredCart();
    renderProducts();
    updateHomepageHighlights();
  } catch (error) {
    console.warn('Product API failed', error);
    appState.products = [];
    renderProducts();
    updateHomepageHighlights();
    showNotification(error.message || 'Products are unavailable right now.', 'error');
  }
}

function updateHomepageHighlights() {
  const products = appState.products || [];
  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 2);
  const lowestPrice = products.length ? Math.min(...products.map((product) => product.finalPrice)) : 0;
  const highestPrice = products.length ? Math.max(...products.map((product) => product.finalPrice)) : 0;
  const categoryCount = new Set(products.map((product) => product.category)).size;
  const heroStats = document.querySelectorAll('.hero-stats article');
  const marketPills = document.querySelectorAll('.market-strip .market-pill');
  const panels = document.querySelectorAll('.homepage-panels .homepage-panel');
  const runwayCards = document.querySelectorAll('.feature-runway-card');

  if (heroStats[0]) {
    const strong = heroStats[0].querySelector('strong');
    const span = heroStats[0].querySelector('span');
    if (strong) strong.textContent = `${products.length} Live Pieces`;
    if (span) span.textContent = `${categoryCount} categories refreshed from the backend`;
  }

  if (heroStats[1]) {
    const strong = heroStats[1].querySelector('strong');
    const span = heroStats[1].querySelector('span');
    if (strong) strong.textContent = `${featuredProducts.length || Math.min(products.length, 2)} Featured Picks`;
    if (span) {
      span.textContent = featuredProducts.length
        ? 'Top styles loaded from the current catalog'
        : 'Featured styles will appear as soon as the catalog loads';
    }
  }

  if (heroStats[2]) {
    const strong = heroStats[2].querySelector('strong');
    const span = heroStats[2].querySelector('span');
    if (strong) strong.textContent = lowestPrice ? `From Rs ${lowestPrice}` : 'Live Pricing';
    if (span) {
      span.textContent = highestPrice
        ? `Up to Rs ${highestPrice} across the catalog`
        : 'Pricing comes from the live backend';
    }
  }

  if (marketPills[0]) marketPills[0].textContent = `${products.length} live styles`;
  if (marketPills[1]) marketPills[1].textContent = `${categoryCount} style families`;
  if (marketPills[2]) marketPills[2].textContent = `${featuredProducts.length} featured picks`;
  if (marketPills[3]) marketPills[3].textContent = lowestPrice ? `From Rs ${lowestPrice}` : 'Backend pricing';
  if (marketPills[4]) marketPills[4].textContent = 'Live shopping experience';

  if (panels[0]) {
    const title = panels[0].querySelector('h3');
    if (title) title.textContent = 'Professional polish built around current product data.';
  }
  if (panels[1]) {
    const title = panels[1].querySelector('h3');
    if (title) title.textContent = 'Premium ceremonial looks pulled from the live catalog.';
  }
  if (panels[2]) {
    const title = panels[2].querySelector('h3');
    if (title) title.textContent = 'Statement pieces that refresh as the catalog changes.';
  }
  if (panels[3]) {
    const title = panels[3].querySelector('h3');
    if (title) title.textContent = 'Refined comfort with backend-fed availability.';
  }

  if (runwayCards[0]) {
    const title = runwayCards[0].querySelector('h3');
    const text = runwayCards[0].querySelector('p');
    if (title) title.textContent = 'VIP Access';
    if (text) text.textContent = 'Membership pricing and perks are pulled from live tier data.';
  }
  if (runwayCards[1]) {
    const title = runwayCards[1].querySelector('h3');
    const text = runwayCards[1].querySelector('p');
    if (title) title.textContent = 'Custom Studio';
    if (text) text.textContent = 'Custom orders and follow-up flows are backed by the API.';
  }
}

function getFilteredProducts() {
  const term = appState.search.trim().toLowerCase();

  let filtered = appState.products.filter((product) => {
    const categoryMatch =
      appState.selectedCategory === 'All' || product.category === appState.selectedCategory;

    const audienceMatch =
      appState.selectedAudience === 'All' || product.audience === appState.selectedAudience;

    const priceMatch =
      appState.selectedPrice === 'all' ||
      (appState.selectedPrice === 'under-2500' && product.finalPrice < 2500) ||
      (appState.selectedPrice === '2500-5000' && product.finalPrice >= 2500 && product.finalPrice <= 5000) ||
      (appState.selectedPrice === 'above-5000' && product.finalPrice > 5000);

    const searchMatch =
      !term ||
      [product.name, product.category, product.audience, product.description]
        .join(' ')
        .toLowerCase()
        .includes(term);

    return categoryMatch && audienceMatch && priceMatch && searchMatch;
  });

  // Sort products
  if (appState.sort === 'price-asc') {
    filtered = filtered.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (appState.sort === 'price-desc') {
    filtered = filtered.sort((a, b) => b.finalPrice - a.finalPrice);
  }

  return filtered;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  productGrid.innerHTML = '';

  filtered.forEach((product) => {
    const fragment = productTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.product-card');
    const visual = fragment.querySelector('.product-visual');
    const badge = fragment.querySelector('.product-badge');
    const favoriteToggle = fragment.querySelector('.favorite-toggle');
    const category = fragment.querySelector('.product-category');
    const name = fragment.querySelector('.product-name');
    const description = fragment.querySelector('.product-description');
    const price = fragment.querySelector('.product-price');
    const rating = fragment.querySelector('.product-rating');
    const sizeRow = fragment.querySelector('.size-row');
    const addCartBtn = fragment.querySelector('.add-cart-btn');

    // Set product palette
    visual.style.setProperty('--product-background', product.palette || 'linear-gradient(135deg, #d9c4a3, #8b5a36)');

    badge.textContent = product.badge || 'New';
    category.textContent = `${product.category} - ${product.audience}`;
    name.textContent = product.name;
    description.textContent = product.description;

    // Display pricing with discount if applicable
    if (product.discountPercentage > 0) {
      price.innerHTML = `
        <span class="discounted-price">${formatPrice(product.finalPrice)}</span>
        <span class="original-price">${formatPrice(product.basePrice)}</span>
        <span class="discount-badge">-${product.discountPercentage}%</span>
      `;
    } else {
      price.textContent = formatPrice(product.finalPrice);
    }

    rating.textContent = `${product.rating || 4.5} ★`;

    // Handle favorites
    if (appState.favorites.includes(product._id)) {
      favoriteToggle.classList.add('active');
      favoriteToggle.textContent = '❤️';
    }

    favoriteToggle.addEventListener('click', () => toggleFavorite(product._id, favoriteToggle));

    // Add sizes
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach((size) => {
        const chip = document.createElement('span');
        chip.className = 'size-chip';
        chip.textContent = size;
        sizeRow.appendChild(chip);
      });
    }

    addCartBtn.addEventListener('click', () => addToCart(product));
    card.dataset.productId = product._id;
    productGrid.appendChild(fragment);
  });

  resultsText.textContent = filtered.length
    ? `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`
    : 'No products match these filters';
}

// ==================== CART MANAGEMENT ====================

async function addToCart(product) {
  if (!api.isAuthenticated()) {
    showNotification('Please login to add items to cart', 'warning');
    authModal.hidden = false;
    return;
  }

  const existingItem = appState.cart.find((item) => item.productId === product._id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    appState.cart.push({
      productId: product._id,
      productName: product.name,
      price: product.finalPrice,
      quantity: 1,
      size: product.sizes?.[0] || 'One Size',
    });
  }

  saveStorage(STORAGE_KEYS.cart, appState.cart);
  updateCartDisplay();
  showNotification(`${product.name} added to cart`, 'success');
}

function removeFromCart(productId) {
  appState.cart = appState.cart.filter(
    (item) => String(item.productId || item.id || item._id) !== String(productId)
  );
  saveStorage(STORAGE_KEYS.cart, appState.cart);
  updateCartDisplay();
}

function updateCartQuantity(productId, quantity) {
  const item = appState.cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveStorage(STORAGE_KEYS.cart, appState.cart);
    updateCartDisplay();
  }
}

function renderCartItems() {
  if (!cartItems) return;

  cartItems.innerHTML = '';
  if (appState.cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Your bag is empty. Add items to see them here.</p>
      </div>
    `;
    if (checkoutButton) {
      checkoutButton.disabled = true;
    }
    return;
  }

  if (checkoutButton) {
    checkoutButton.disabled = false;
  }

  appState.cart.forEach((item) => {
    const displayItem = normalizeCartItem(item);
    if (!displayItem) return;

    const cartCard = document.createElement('article');
    cartCard.className = 'cart-item';
    cartCard.innerHTML = `
      <div>
        <h3>${displayItem.productName}</h3>
        <small>${displayItem.size} • Qty ${displayItem.quantity}</small>
        <p>${formatPrice(displayItem.price)} each</p>
      </div>
      <div class="cart-item-actions">
        <button class="secondary-btn small remove-cart-btn" data-product-id="${displayItem.productId}">Remove</button>
        <div class="quantity-control">
          <label>
            Qty
            <input type="number" min="1" value="${displayItem.quantity}" class="cart-quantity-input" data-product-id="${displayItem.productId}" />
          </label>
        </div>
      </div>
    `;

    cartItems.appendChild(cartCard);
  });

  cartItems.querySelectorAll('.remove-cart-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const id = event.currentTarget.dataset.productId;
      removeFromCart(id);
    });
  });

  cartItems.querySelectorAll('.cart-quantity-input').forEach((input) => {
    input.addEventListener('change', (event) => {
      const id = event.currentTarget.dataset.productId;
      updateCartQuantity(id, Number(event.currentTarget.value));
    });
  });
}

function updateCartDisplay() {
  normalizeStoredCart();

  if (cartCount) {
    const totalQuantity = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = String(totalQuantity);
  }
  const total = appState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (cartTotal) {
    cartTotal.textContent = formatPrice(total);
  }
  renderCartItems();
}

function getCartTotal() {
  return appState.cart.reduce((sum, item) => {
    const normalized = normalizeCartItem(item);
    return sum + Number(normalized?.price || 0) * Number(normalized?.quantity || 1);
  }, 0);
}

function saveStoredOrders() {
  saveStorage(STORAGE_KEYS.orders, appState.orders);
}

function createLocalOrderRecord() {
  const order = {
    id: pendingPaymentContext.reference,
    orderNumber: pendingPaymentContext.reference,
    paymentReference: pendingPaymentContext.reference,
    customerName: pendingPaymentContext.customer?.firstName || pendingPaymentContext.customer?.name || 'Customer',
    customerEmail: pendingPaymentContext.customer?.email || '',
    items: appState.cart.map((item) => ({ ...normalizeCartItem(item) })),
    totalAmount: pendingPaymentContext.amount,
    orderStatus: 'payment_pending',
    paymentStatus: 'pending',
    paymentMethod: '',
    createdAt: new Date().toISOString(),
  };

  appState.orders.unshift(order);
  saveStoredOrders();
  return order;
}

function markLocalOrderPaid(reference, paymentMethod = 'Razorpay') {
  const order = appState.orders.find((item) => item.paymentReference === reference || item.id === reference);
  if (!order) {
    return;
  }

  order.orderStatus = 'confirmed';
  order.paymentStatus = 'paid';
  order.paymentMethod = paymentMethod;
  order.paidAt = new Date().toISOString();
  saveStoredOrders();
}

function syncDrawerOverlay() {
  if (!overlay) return;
  const drawerOpen =
    Boolean(cartDrawer?.classList.contains('open')) ||
    Boolean(favoritesDrawer?.classList.contains('open'));
  overlay.hidden = !drawerOpen;
}

function openCart() {
  if (!cartDrawer) return;
  closeFavorites();
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  syncDrawerOverlay();
  renderCartItems();
}

function closeCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  syncDrawerOverlay();
}

async function checkoutCart() {
  if (!api.isAuthenticated()) {
    showNotification('Please login to checkout', 'warning');
    authModal.hidden = false;
    return;
  }

  if (appState.cart.length === 0) {
    showNotification('Your cart is empty', 'warning');
    return;
  }

  pendingPaymentContext = {
    type: 'order',
    amount: getCartTotal(),
    reference: createPaymentReference('ORDER'),
    note: 'House of Styles order',
    customer: getCurrentUser(),
    gatewayMethod: 'card',
    gatewayRail: 'credit',
  };
  createLocalOrderRecord();

  paymentModal.hidden = false;
  closeCart();
  showGatewayHandoff('card', 'credit');
  showNotification('Choose a payment method to complete checkout.', 'info');
}

// ==================== PAYMENT HANDLING ====================

function showGatewayHandoff(method, rail = 'credit') {
  ensurePendingPaymentContext();
  pendingPaymentContext.gatewayMethod = method;
  pendingPaymentContext.gatewayRail = rail;

  if (gatewayPaymentForm) gatewayPaymentForm.hidden = false;
  if (upiPaymentForm) upiPaymentForm.hidden = true;

  updateGatewayPaymentDetails();
  setPaymentMessage(`Ready for ${formatPaymentMethodLabel(method, rail)}. Open secure checkout to continue.`);
}

function showUpiHandoff() {
  ensurePendingPaymentContext();
  pendingPaymentContext.gatewayMethod = 'upi';
  pendingPaymentContext.gatewayRail = 'direct';

  if (gatewayPaymentForm) gatewayPaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = false;

  const { merchantName, merchantUpiId } = getPaymentConfig();
  const upiUrl = buildUpiPaymentUrl(pendingPaymentContext);

  const upiMerchantValue = document.getElementById('upiMerchantValue');
  const upiAmountValue = document.getElementById('upiAmountValue');
  const upiReferenceValue = document.getElementById('upiReferenceValue');
  const openUPIAppButton = document.getElementById('openUPIAppButton');
  const confirmUPIPaymentButton = document.getElementById('confirmUPIPaymentButton');
  const copyUPILinkButton = document.getElementById('copyUPILinkButton');

  if (upiMerchantValue) {
    upiMerchantValue.textContent = merchantUpiId
      ? `${merchantName} (${merchantUpiId})`
      : 'UPI ID not configured';
  }

  if (upiAmountValue) {
    upiAmountValue.textContent = formatPrice(pendingPaymentContext.amount || 0);
  }

  if (upiReferenceValue) {
    upiReferenceValue.textContent = pendingPaymentContext.reference || '-';
  }

  if (openUPIAppButton) {
    openUPIAppButton.href = upiUrl || '#';
    openUPIAppButton.setAttribute('aria-disabled', upiUrl ? 'false' : 'true');
  }

  if (confirmUPIPaymentButton) {
    confirmUPIPaymentButton.disabled = !upiUrl;
  }

  if (copyUPILinkButton) {
    copyUPILinkButton.disabled = !upiUrl;
  }

  setPaymentMessage('Direct UPI is ready. Open your app or copy the link to continue.');
}

async function createGatewayOrder() {
  const { apiBaseUrl, razorpayOrderEndpoint } = getPaymentConfig();
  const endpoints = [razorpayOrderEndpoint, apiBaseUrl ? `${apiBaseUrl}/create-order` : ''].filter(Boolean);
  if (!endpoints.length) {
    throw new Error('Razorpay order endpoint is not configured.');
  }

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.max(100, Math.round(Number(pendingPaymentContext?.amount || 0) * 100)),
          currency: 'INR',
          receipt: pendingPaymentContext?.reference || createPaymentReference('ORDER'),
          notes: {
            reference: pendingPaymentContext?.reference,
            type: pendingPaymentContext?.type,
            method: formatPaymentMethodLabel(
              pendingPaymentContext?.gatewayMethod || 'card',
              pendingPaymentContext?.gatewayRail || 'credit'
            ),
          },
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (response.ok && body.success) {
        return body;
      }

      lastError = new Error(body.message || 'Razorpay order could not be created.');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Razorpay order could not be created.');
}

async function verifyGatewayPayment(response = {}) {
  const { apiBaseUrl, razorpayVerifyEndpoint } = getPaymentConfig();
  const endpoints = [razorpayVerifyEndpoint, apiBaseUrl ? `${apiBaseUrl}/verify-payment` : ''].filter(Boolean);
  if (!endpoints.length) {
    throw new Error('Razorpay verification endpoint is not configured.');
  }

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const verifyResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const body = await verifyResponse.json().catch(() => ({}));
      if (verifyResponse.ok && body.success) {
        return body;
      }

      lastError = new Error(body.message || 'Razorpay payment verification failed.');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Razorpay payment verification failed.');
}

async function openGatewayCheckout() {
  const { merchantName, razorpayKeyId } = getPaymentConfig();

  ensurePendingPaymentContext();

  if (!window.Razorpay) {
    setPaymentMessage('Secure checkout could not load. Check the network and try again.', 'error');
    return;
  }

  try {
    setPaymentMessage('Creating secure payment order...');
    const orderResponse = await createGatewayOrder();
    const order = orderResponse.order || {
      id: orderResponse.order_id,
      amount: orderResponse.amount,
      currency: orderResponse.currency,
    };

    const customer = getCurrentUser();
    const checkout = new window.Razorpay({
      key: orderResponse.keyId || razorpayKeyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      order_id: order.id,
      name: merchantName,
      description: pendingPaymentContext.note || 'House of Styles order',
      prefill: {
        name: customer?.firstName || customer?.name || '',
        email: customer?.email || '',
      },
      notes: {
        reference: pendingPaymentContext.reference,
        type: pendingPaymentContext.type,
        method: formatPaymentMethodLabel(
          pendingPaymentContext.gatewayMethod || 'card',
          pendingPaymentContext.gatewayRail || 'credit'
        ),
      },
      handler: async (response) => {
        try {
          setPaymentMessage('Verifying payment...');
          await verifyGatewayPayment(response);
          paymentComplete();
        } catch (error) {
          setPaymentMessage(error.message || 'Payment verification failed.', 'error');
        }
      },
      modal: {
        ondismiss() {
          setPaymentMessage('Secure checkout closed before payment was confirmed.', 'error');
        },
      },
    });

    checkout.on('payment.failed', function (response) {
      const reason = response?.error?.description || response?.error?.reason || 'Payment failed.';
      setPaymentMessage(reason, 'error');
    });

    checkout.open();
    setPaymentMessage('Secure checkout opened. Complete the payment there.');
  } catch (error) {
    setPaymentMessage(error.message || 'Secure checkout could not start.', 'error');
  }
}

function paymentComplete() {
  appState.cart = [];
  saveStorage(STORAGE_KEYS.cart, appState.cart);
  updateCartDisplay();

  if (pendingPaymentContext?.reference) {
    markLocalOrderPaid(pendingPaymentContext.reference, 'Razorpay');
  }

  paymentModal.hidden = true;
  pendingPaymentContext = null;
  showNotification('Payment successful! Order confirmed.', 'success');

  // Refresh UI
  renderProducts();
}

// ==================== FAVORITES MANAGEMENT ====================

async function toggleFavorite(productId, element) {
  if (!api.isAuthenticated()) {
    showNotification('Please login to save favorites', 'warning');
    authModal.hidden = false;
    return;
  }

  const index = appState.favorites.indexOf(productId);

  if (index > -1) {
    appState.favorites.splice(index, 1);
    element.classList.remove('active');
    element.textContent = 'Fav';
  } else {
    appState.favorites.push(productId);
    element.classList.add('active');
    element.textContent = '❤️';
  }

  saveStorage(STORAGE_KEYS.favorites, appState.favorites);
  updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
  if (favoritesCount) {
    favoritesCount.textContent = appState.favorites.length;
  }

  if (favoritesTotal) {
    const label = appState.favorites.length === 1 ? '1 item' : `${appState.favorites.length} items`;
    favoritesTotal.textContent = label;
  }

  renderFavoriteItems();
}

function renderFavoriteItems() {
  if (!favoriteItems) return;

  favoriteItems.innerHTML = '';

  if (appState.favorites.length === 0) {
    favoriteItems.innerHTML = `
      <div class="empty-cart">
        <p>Your favorites list is empty. Tap Fav on styles you want to revisit.</p>
      </div>
    `;
    return;
  }

  const productsById = new Map(appState.products.map((product) => [product._id, product]));

  appState.favorites.forEach((productId) => {
    const product = productsById.get(productId);
    if (!product) return;

    const favoriteCard = document.createElement('article');
    favoriteCard.className = 'cart-item favorite-item';
    favoriteCard.innerHTML = `
      <div>
        <h3>${product.name}</h3>
        <small>${product.category} - ${product.audience}</small>
        <p>${formatPrice(product.finalPrice)}</p>
      </div>
      <div class="cart-item-actions">
        <button class="secondary-btn small remove-favorite-btn" data-product-id="${product._id}">Remove</button>
        <button class="primary-btn small favorite-add-cart-btn" data-product-id="${product._id}">Add to Cart</button>
      </div>
    `;

    favoriteItems.appendChild(favoriteCard);
  });

  if (!favoriteItems.children.length) {
    favoriteItems.innerHTML = `
      <div class="empty-cart">
        <p>Saved styles will appear here after products load.</p>
      </div>
    `;
    return;
  }

  favoriteItems.querySelectorAll('.remove-favorite-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const productId = event.currentTarget.dataset.productId;
      appState.favorites = appState.favorites.filter((id) => id !== productId);
      saveStorage(STORAGE_KEYS.favorites, appState.favorites);
      updateFavoritesDisplay();
      renderProducts();
      showNotification('Removed from favorites', 'info');
    });
  });

  favoriteItems.querySelectorAll('.favorite-add-cart-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const productId = event.currentTarget.dataset.productId;
      const product = productsById.get(productId);
      if (product) {
        addToCart(product);
      }
    });
  });
}

function openFavorites() {
  if (!favoritesDrawer) return;
  closeCart();
  favoritesDrawer.classList.add('open');
  favoritesDrawer.setAttribute('aria-hidden', 'false');
  syncDrawerOverlay();
  renderFavoriteItems();
}

function closeFavorites() {
  if (!favoritesDrawer) return;
  favoritesDrawer.classList.remove('open');
  favoritesDrawer.setAttribute('aria-hidden', 'true');
  syncDrawerOverlay();
}

function getCurrentUser() {
  return appState.currentUser || api.getUser() || {};
}

function formatNotificationStatus(notifications) {
  if (!notifications) {
    return 'Welcome greeting queued for your registered email and mobile number.';
  }

  const emailStatus = notifications.email?.to
    ? `Email sent to ${notifications.email.to}`
    : 'Email greeting skipped';
  const smsStatus = notifications.sms?.to
    ? `Mobile greeting sent to ${notifications.sms.to}`
    : 'Mobile greeting skipped';

  return `${emailStatus}. ${smsStatus}.`;
}

function renderProfileSummary() {
  if (!profileSummary) return;
  const user = getCurrentUser();
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer';
  const membershipName = appState.userMembership?.membershipTier?.name || 'Standard';
  const cartQuantity = appState.cart.reduce((sum, item) => sum + item.quantity, 0);

  profileSummary.innerHTML = `
    <p><strong>${escapeHTML(fullName)}</strong>${escapeHTML(user.email || 'No email saved')}</p>
    <p><strong>Mobile</strong>${escapeHTML(user.phone || 'Not added')}</p>
    <p><strong>Membership</strong>${escapeHTML(membershipName)}</p>
    <p><strong>Saved Activity</strong>${appState.favorites.length} favorites - ${cartQuantity} bag item${cartQuantity === 1 ? '' : 's'}</p>
  `;

  // Reset visibility
  document.getElementById('ordersSection').hidden = true;
  document.getElementById('profileActionsGroup').hidden = false;
  document.getElementById('profileSummary').hidden = false;
}

async function loadAndRenderOrders() {
  const ordersList = document.getElementById('ordersList');
  const ordersSection = document.getElementById('ordersSection');
  const profileActionsGroup = document.getElementById('profileActionsGroup');
  const profileSummary = document.getElementById('profileSummary');

  ordersList.innerHTML = '<p>Loading orders...</p>';
  ordersSection.hidden = false;
  profileActionsGroup.hidden = true;
  profileSummary.hidden = true;

  try {
    const response = await api.getOrders();
    const orders = response.data || [];

    if (orders.length === 0) {
      ordersList.innerHTML = '<p class="empty-state">No orders found yet.</p>';
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="order-history-card">
        <div class="header">
          <strong>${order.orderNumber || order.paymentReference || 'ORD'}</strong>
          <span class="status status-${order.orderStatus || 'pending'}">${order.orderStatus || 'pending'}</span>
        </div>
        <p class="small">${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>${formatPrice(order.totalAmount || order.total || 0)}</strong> (${order.items?.length || 0} items)</p>
      </div>
    `).join('');
  } catch (error) {
    const fallbackOrders = appState.orders || [];

    if (!fallbackOrders.length) {
      ordersList.innerHTML = '<p class="error-text">Failed to load orders. Please try again later.</p>';
      return;
    }

    ordersList.innerHTML = fallbackOrders.map((order) => `
      <div class="order-history-card">
        <div class="header">
          <strong>${order.orderNumber || order.paymentReference || 'ORD'}</strong>
          <span class="status status-${order.orderStatus || 'pending'}">${order.orderStatus || 'pending'}</span>
        </div>
        <p class="small">${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>${formatPrice(order.totalAmount || order.total || 0)}</strong> (${order.items?.length || 0} items)</p>
      </div>
    `).join('');
  }
}

function openAccountModal(title, text) {
  if (!accountModal) return;
  if (accountModalTitle) accountModalTitle.textContent = title;
  if (accountModalText) accountModalText.textContent = text;
  renderProfileSummary();
  accountModal.hidden = false;
}

function closeAccountModal() {
  if (accountModal) {
    accountModal.hidden = true;
  }
}

function openProfileModal() {
  const user = getCurrentUser();
  const firstName = user.firstName || 'there';
  openAccountModal(
    `Hi, ${firstName}`,
    'Manage your bag, favorites, membership, custom styling, and notification settings from here.'
  );
}

function showAuthForm(formName) {
  const forms = document.querySelectorAll('.auth-form');
  forms.forEach((form) => form.classList.remove('active'));

  if (formName === 'signup') {
    customerSignupForm?.classList.add('active');
  } else if (formName === 'forgot') {
    forgotPasswordForm?.classList.add('active');
  } else {
    customerLoginForm?.classList.add('active');
  }

  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.authTab === formName);
  });
}

// ==================== AUTHENTICATION ====================

async function handleSignup(formData) {
  try {
    const fullName = formData.get('name')?.trim() || '';
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
    const email = formData.get('email');
    const phone = formData.get('phone');

    const response = await api.register(
      email,
      formData.get('password'),
      firstName,
      lastName,
      phone
    );

    appState.currentUser = response.user;
    showNotification('Account created successfully. Greeting sent.', 'success');
    
    authModal.hidden = true;
    updateAuthUI();

    // Reload products to get membership pricing
    await loadProducts();
    await loadUserMembership();

    // Connect Socket.IO
    notificationManager.connect();
    setupNotificationListeners();

    openAccountModal(
      `Welcome, ${firstName}`,
      formatNotificationStatus(response.notifications)
    );
  } catch (error) {
    console.error('Signup error:', error);
    showNotification(error.message || 'Signup failed', 'error');
  }
}

async function handleLogin(formData) {
  try {
    const response = await api.login(
      formData.get('email'),
      formData.get('password')
    );

    appState.currentUser = response.user;
    showNotification('Logged in successfully!', 'success');
    
    authModal.hidden = true;
    updateAuthUI();

    // Reload products to get membership pricing
    await loadProducts();
    await loadUserMembership();

    // Connect Socket.IO
    notificationManager.connect();
    setupNotificationListeners();
  } catch (error) {
    console.error('Login error:', error);
    showNotification(error.message || 'Login failed', 'error');
  }
}

function updateAuthUI() {
  if (api.isAuthenticated()) {
    const user = getCurrentUser();
    openAuthModalBtn.textContent = `Hi, ${user.firstName || 'Profile'}`;
  } else {
    openAuthModalBtn.textContent = 'Login / Sign Up';
  }
}

async function handleForgotPassword(formData) {
  const email = formData.get('email');

  try {
    const response = await api.forgotPassword(email);
    if (passwordResetMessage) {
      passwordResetMessage.textContent = response.message;
    }
    showNotification('Password reset instructions sent if the account exists', 'success');
  } catch (error) {
    console.error('Forgot password error:', error);
    if (passwordResetMessage) {
      passwordResetMessage.textContent = error.message || 'Unable to send reset instructions';
    }
    showNotification(error.message || 'Unable to send reset instructions', 'error');
  }
}

async function handleLogout() {
  try {
    await api.logout();
    appState.currentUser = null;
    appState.cart = [];
    appState.favorites = [];
    notificationManager.disconnect();
    closeCart();
    closeFavorites();
    updateCartDisplay();
    updateFavoritesDisplay();
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
    await loadProducts();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ==================== MEMBERSHIP MANAGEMENT ====================

async function loadMembershipTiers() {
  try {
    const response = await api.getMembershipTiers();
    appState.membershipTiers = response.data || [];
  } catch (error) {
    appState.membershipTiers = [];
  }
}

async function loadUserMembership() {
  if (!api.isAuthenticated()) return;

  try {
    const response = await api.getUserMembership();
    appState.userMembership = response.data;
  } catch (error) {
    console.error('Error loading user membership:', error);
  }
}

async function upgradeMembership(tierName, duration = 'annual') {
  if (!api.isAuthenticated()) {
    showNotification('Please login to upgrade membership', 'warning');
    return;
  }

  try {
    const response = await api.upgradeMembership(tierName, duration);
    appState.userMembership = response.data;
    showNotification(`Upgraded to ${tierName} membership!`, 'success');
    await loadProducts(); // Reload to show new pricing
  } catch (error) {
    console.error('Upgrade error:', error);
    showNotification(error.message || 'Upgrade failed', 'error');
  }
}

// ==================== NOTIFICATION SYSTEM ====================

function setupNotificationListeners() {
  notificationManager.on('orderStatusUpdated', (data) => {
    showNotification(`Order ${data.orderId} status: ${data.status}`, 'info');
  });

  notificationManager.on('customOrderQuoted', (data) => {
    showNotification(`Quote received: Rs ${data.quotedPrice}`, 'success');
  });

  notificationManager.on('error', (error) => {
    console.error('Notification error:', error);
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Cart and Favorites top buttons
  const favoritesButton = document.getElementById('favoritesButton');
  const cartButton = document.getElementById('cartButton');

  if (favoritesButton) {
    favoritesButton.addEventListener('click', () => {
      openFavorites();
    });
  }

  if (cartButton) {
    cartButton.addEventListener('click', () => {
      openCart();
    });
  }

  if (closeCartButton) {
    closeCartButton.addEventListener('click', closeCart);
  }

  if (closeFavoritesButton) {
    closeFavoritesButton.addEventListener('click', closeFavorites);
  }

  if (browseFavoritesButton) {
    browseFavoritesButton.addEventListener('click', () => {
      closeFavorites();
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      closeCart();
      closeFavorites();
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener('click', checkoutCart);
  }

  setupShopDropdown();
  setupVIPInterestForm();

  // Auth modal
  openAuthModalBtn.addEventListener('click', () => {
    if (api.isAuthenticated()) {
      openProfileModal();
    } else {
      showAuthForm('signup');
      authModal.hidden = false;
    }
  });

  closeAuthModalBtn.addEventListener('click', () => {
    authModal.hidden = true;
  });

  if (closeAccountModalBtn) {
    closeAccountModalBtn.addEventListener('click', closeAccountModal);
  }

  if (confirmAccountModalBtn) {
    confirmAccountModalBtn.addEventListener('click', closeAccountModal);
  }

  document.getElementById('backToProfileBtn')?.addEventListener('click', () => {
    document.getElementById('ordersSection').hidden = true;
    document.getElementById('profileActionsGroup').hidden = false;
    document.getElementById('profileSummary').hidden = false;
  });

  document.querySelectorAll('[data-profile-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.profileAction;

      if (action === 'cart') {
        closeAccountModal();
        openCart();
      } else if (action === 'orders') {
        await loadAndRenderOrders();
      } else if (action === 'favorites') {
        closeAccountModal();
        openFavorites();
      } else if (action === 'membership') {
        window.location.href = 'vip.html';
      } else if (action === 'custom') {
        window.location.href = 'custom.html';
      } else if (action === 'notifications') {
        showNotification('Email, SMS, order updates, and VIP offers are enabled for this profile.', 'info');
      } else if (action === 'logout') {
        closeAccountModal();
        await handleLogout();
      }
    });
  });

  // Payment modal
  closePaymentModalBtn.addEventListener('click', () => {
    paymentModal.hidden = true;
    pendingPaymentContext = null;
  });

  creditCardPaymentBtn?.addEventListener('click', () => showGatewayHandoff('card', 'credit'));
  debitCardPaymentBtn?.addEventListener('click', () => showGatewayHandoff('card', 'debit'));
  netbankingPaymentBtn?.addEventListener('click', () => showGatewayHandoff('netbanking'));
  gatewayUPIPaymentBtn?.addEventListener('click', () => showGatewayHandoff('upi', 'apps'));
  upiPaymentBtn?.addEventListener('click', showUpiHandoff);
  openGatewayCheckoutButton?.addEventListener('click', openGatewayCheckout);
  document.getElementById('openUPIAppButton')?.addEventListener('click', (event) => {
    const upiUrl = buildUpiPaymentUrl();
    if (!upiUrl) {
      event.preventDefault();
      setPaymentMessage('Merchant UPI ID is not configured yet.', 'error');
      return;
    }

    setPaymentMessage('UPI app opened. Complete the payment there, then return and confirm.');
  });
  document.getElementById('confirmUPIPaymentButton')?.addEventListener('click', () => {
    if (!buildUpiPaymentUrl()) {
      setPaymentMessage('Merchant UPI ID is not configured yet.', 'error');
      return;
    }

    paymentComplete();
  });
  document.getElementById('copyUPILinkButton')?.addEventListener('click', async () => {
    const upiUrl = buildUpiPaymentUrl();
    if (!upiUrl) {
      setPaymentMessage('Merchant UPI ID is not configured yet.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(upiUrl);
      setPaymentMessage('UPI payment link copied.');
    } catch {
      setPaymentMessage('UPI payment link is ready, but clipboard access was blocked.', 'error');
    }
  });

  // Auth forms
  customerSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSignup(new FormData(customerSignupForm));
    customerSignupForm.reset();
  });

  customerLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin(new FormData(customerLoginForm));
    customerLoginForm.reset();
  });

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleForgotPassword(new FormData(forgotPasswordForm));
    });
  }

  if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener('click', () => {
      showAuthForm('forgot');
    });
  }

  if (backToLoginButton) {
    backToLoginButton.addEventListener('click', () => {
      showAuthForm('login');
    });
  }

  // Search and sort
  searchInput.addEventListener('input', (e) => {
    appState.search = e.target.value;
    renderProducts();
  });

  sortSelect.addEventListener('change', (e) => {
    appState.sort = e.target.value;
    renderProducts();
  });

  // Category pills
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      appState.selectedCategory = pill.textContent;
      renderProducts();
    });
  });

  // Price range filters
  const priceFilters = document.querySelectorAll('.price-filter');
  priceFilters.forEach((button) => {
    button.addEventListener('click', () => {
      priceFilters.forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      appState.selectedPrice = button.dataset.price || 'all';
      renderProducts();
    });
  });

  // Audience filters
  const audienceFilters = document.querySelectorAll('.audience-filter');
  audienceFilters.forEach((button) => {
    button.addEventListener('click', () => {
      audienceFilters.forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      appState.selectedAudience = button.dataset.audience || 'All';
      renderProducts();
    });
  });

  // Clear filters button
  const clearFiltersButton = document.getElementById('clearFiltersButton');
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => {
      appState.selectedCategory = 'All';
      appState.selectedPrice = 'all';
      appState.selectedAudience = 'All';
      appState.search = '';
      appState.sort = 'featured';

      searchInput.value = '';
      sortSelect.value = 'featured';

      // Reset category pills
      categoryPills.forEach((pill) => {
        pill.classList.remove('active');
        if (pill.textContent === 'All') {
          pill.classList.add('active');
        }
      });

      // Reset price filters
      priceFilters.forEach((button) => {
        button.classList.remove('active');
        if (button.dataset.price === 'all') {
          button.classList.add('active');
        }
      });

      // Reset audience filters
      audienceFilters.forEach((button) => {
        button.classList.remove('active');
        if (button.dataset.audience === 'All') {
          button.classList.add('active');
        }
      });

      renderProducts();
      showNotification('Filters cleared', 'info');
    });
  }

  // Auth tabs
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.authTab;

      showAuthForm(tabName);
    });
  });
}

function setupShopDropdown() {
  const button = document.getElementById('shopMenuButton');
  const menu = document.getElementById('shopDropdownMenu');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    const shouldOpen = menu.hasAttribute('hidden');
    menu.toggleAttribute('hidden', !shouldOpen);
    button.setAttribute('aria-expanded', String(shouldOpen));
  });

  document.querySelectorAll('[data-category-shortcut]').forEach((item) => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category-shortcut') || 'All';
      appState.selectedCategory = category;

      categoryPills.forEach((pill) => {
        const pillCategory = pill.dataset.category || pill.textContent.trim();
        pill.classList.toggle('active', pillCategory === category);
      });

      menu.setAttribute('hidden', '');
      button.setAttribute('aria-expanded', 'false');
      renderProducts();
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.addEventListener('click', (event) => {
    if (!menu.hasAttribute('hidden') && !event.target.closest('.nav-dropdown')) {
      menu.setAttribute('hidden', '');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupVIPInterestForm() {
  const vipForm = document.getElementById('vipForm');
  if (!vipForm) {
    return;
  }

  vipForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(vipForm);
    const lead = {
      ...Object.fromEntries(formData.entries()),
      createdAt: new Date().toISOString(),
    };

    const saved = loadStorage('houseOfTailor-vip-leads', []);
    saved.unshift(lead);
    saveStorage('houseOfTailor-vip-leads', saved);
    vipForm.reset();

    const message = document.getElementById('vipMessage');
    if (message) {
      message.textContent = 'VIP interest saved. Our team can follow up from this lead.';
    }
    showNotification('VIP interest saved', 'success');
  });
}

// ==================== UTILITY FUNCTIONS ====================

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u20B9/g, 'Rs ');
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getPaymentConfig() {
  const config = window.HOS_CONFIG || {};
  const apiBaseUrl = String(config.apiBaseUrl || '').replace(/\/$/, '');

  return {
    apiBaseUrl,
    merchantName: String(config.merchantName || 'House of Styles').trim(),
    merchantUpiId: String(config.merchantUpiId || config.upiId || 'houseofstyles@upi').trim(),
    razorpayKeyId: String(config.razorpayKeyId || config.razorpayKey || '').trim(),
    razorpayOrderEndpoint: String(
      config.razorpayOrderEndpoint || (apiBaseUrl ? `${apiBaseUrl}/payments/razorpay-order` : '')
    ).trim(),
    razorpayVerifyEndpoint: String(
      config.razorpayVerifyEndpoint || (apiBaseUrl ? `${apiBaseUrl}/payments/razorpay-verify` : '')
    ).trim(),
  };
}

function createPaymentReference(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function formatPaymentMethodLabel(method, rail = '') {
  if (method === 'card' && rail === 'debit') return 'Debit Card';
  if (method === 'card') return 'Credit Card';
  if (method === 'netbanking') return 'Netbanking';
  if (method === 'upi') return rail === 'direct' ? 'Direct UPI' : 'UPI Apps';
  return 'Secure Checkout';
}

function setPaymentMessage(message, type = 'info') {
  if (!paymentMessage) return;
  paymentMessage.textContent = message;
  paymentMessage.classList.toggle('success', type === 'success');
  paymentMessage.classList.toggle('error', type === 'error');
}

function buildUpiPaymentUrl(paymentContext = pendingPaymentContext) {
  const { merchantName, merchantUpiId } = getPaymentConfig();
  if (!paymentContext || !merchantUpiId) {
    return '';
  }

  const params = new URLSearchParams({
    pa: merchantUpiId,
    pn: merchantName,
    am: Number(paymentContext.amount || 0).toFixed(2),
    cu: 'INR',
    tr: paymentContext.reference,
    tn: paymentContext.note,
  });

  return `upi://pay?${params.toString()}`;
}

function updateGatewayPaymentDetails() {
  if (!pendingPaymentContext) return;

  if (gatewayMethodValue) {
    gatewayMethodValue.textContent = formatPaymentMethodLabel(
      pendingPaymentContext.gatewayMethod,
      pendingPaymentContext.gatewayRail
    );
  }

  if (gatewayAmountValue) {
    gatewayAmountValue.textContent = formatPrice(pendingPaymentContext.amount || 0);
  }

  if (gatewayReferenceValue) {
    gatewayReferenceValue.textContent = pendingPaymentContext.reference || '-';
  }
}

function ensurePendingPaymentContext() {
  if (pendingPaymentContext) {
    return pendingPaymentContext;
  }

  pendingPaymentContext = {
    type: 'order',
    amount: getCartTotal(),
    reference: createPaymentReference('ORDER'),
    note: 'House of Styles order',
    customer: getCurrentUser(),
    gatewayMethod: 'card',
    gatewayRail: 'credit',
  };

  return pendingPaymentContext;
}

function normalizeCartItem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const productId = String(item.productId || item.id || item._id || '').trim();
  const matchedProduct = appState.products.find((product) => String(product._id) === productId);
  const quantity = Math.max(1, Number(item.quantity || 1));
  const price = Number(
    item.price ?? item.finalPrice ?? matchedProduct?.finalPrice ?? matchedProduct?.price ?? 0
  );
  const legacyId = [
    item.productName || item.name || item.title || 'saved-item',
    item.category || item.productCategory || matchedProduct?.category || '',
    item.size || matchedProduct?.sizes?.[0] || '',
  ]
    .filter(Boolean)
    .join('-')
    .replace(/\s+/g, '-')
    .toLowerCase();

  return {
    productId: productId || legacyId || 'legacy-item',
    productName:
      item.productName ||
      item.name ||
      item.title ||
      matchedProduct?.name ||
      'Saved item',
    category:
      item.category ||
      item.productCategory ||
      matchedProduct?.category ||
      'Selected style',
    price,
    quantity,
    size: item.size || matchedProduct?.sizes?.[0] || 'One Size',
  };
}

function normalizeStoredCart() {
  const normalizedCart = appState.cart.map(normalizeCartItem).filter(Boolean);
  const changed = JSON.stringify(normalizedCart) !== JSON.stringify(appState.cart);

  appState.cart = normalizedCart;
  if (changed) {
    saveStorage(STORAGE_KEYS.cart, appState.cart);
  }
}

function showNotification(message, type = 'info') {
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

// ==================== INITIALIZATION ON PAGE LOAD ====================

document.addEventListener('DOMContentLoaded', initializeApp);
