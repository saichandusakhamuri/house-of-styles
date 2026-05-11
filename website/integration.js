/**
 * House of Styles Frontend Integration Script
 * Integrates all frontend functionality with the backend API
 */

// Configuration
const API_BASE_URL = 'http://localhost:5001/api';
const STORAGE_KEYS = {
  cart: 'houseOfTailor-cart',
  favorites: 'houseOfTailor-favorites',
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
  products: [],
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
const stripePaymentBtn = document.getElementById('stripePaymentBtn');
const upiPaymentBtn = document.getElementById('upiPaymentBtn');
const stripePaymentForm = document.getElementById('stripePaymentForm');
const upiPaymentForm = document.getElementById('upiPaymentForm');
const upiIdInput = document.getElementById('upiIdInput');
const submitUPIPaymentBtn = document.getElementById('submitUPIPayment');

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryPills = document.querySelectorAll('.shop-category-strip .pill');

// Stripe Initialization (Using a test key)
let stripe;
try {
  stripe = Stripe('pk_test_51O7YtSCDXzG4U1fWjR6v7Yx8p9q0r1s2t3u4v5w6x7y8z');
} catch (e) {
  console.warn('Stripe not loaded');
}

let stripeElements;
let currentOrderId;

// ==================== INITIALIZATION ====================

async function initializeApp() {
  // Load products from backend
  await loadProducts();

  // Load membership tiers
  await loadMembershipTiers();

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

// ==================== PRODUCT MANAGEMENT ====================

// Mock Data for fallback
const MOCK_PRODUCTS = [
  {
    _id: "mock1",
    name: "Classic Navy Blazer",
    description: "Tailored fit navy blue blazer for professional settings.",
    basePrice: 4500,
    finalPrice: 4500,
    category: "Formal Wear",
    audience: "Everyday",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy Blue"],
    isFeatured: true,
    badge: "Bestseller",
    palette: "linear-gradient(135deg, #2c3e50, #000000)",
    discountPercentage: 0
  },
  {
    _id: "mock2",
    name: "Regal Wedding Sherwani",
    description: "Gold embroidered sherwani for premium wedding styling.",
    basePrice: 12500,
    finalPrice: 12500,
    category: "Wedding Wear",
    audience: "Wedding",
    sizes: ["M", "L", "XL"],
    colors: ["Gold", "Cream"],
    isFeatured: true,
    badge: "Premium",
    palette: "linear-gradient(135deg, #d4af37, #8b4513)",
    discountPercentage: 0
  },
  {
    _id: "mock3",
    name: "Elegant Evening Gown",
    description: "Flowing silk dress designed for evening movement.",
    basePrice: 8900,
    finalPrice: 8900,
    category: "Party Wear",
    audience: "Party",
    sizes: ["XS", "S", "M"],
    colors: ["Emerald Green", "Midnight Black"],
    isFeatured: true,
    badge: "New",
    palette: "linear-gradient(135deg, #004d40, #000000)",
    discountPercentage: 0
  },
  {
    _id: "mock4",
    name: "Casual Linen Shirt",
    description: "Breathable linen shirt for relaxed everyday comfort.",
    basePrice: 2200,
    finalPrice: 2200,
    category: "Casual Wear",
    audience: "Everyday",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Beige"],
    isFeatured: false,
    badge: "Essentials",
    palette: "linear-gradient(135deg, #f5f5f5, #bdbdbd)",
    discountPercentage: 0
  },
  {
    _id: "mock5",
    name: "Festive Silk Kurta Set",
    description: "A polished silk kurta set with festive detailing and all-day comfort.",
    basePrice: 6800,
    finalPrice: 6800,
    category: "Formal Wear",
    audience: "Festive",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Maroon", "Ivory"],
    isFeatured: true,
    badge: "Festive",
    palette: "linear-gradient(135deg, #7f1d1d, #f5d0a9)",
    discountPercentage: 0
  },
  {
    _id: "mock6",
    name: "Tailored Tuxedo Edit",
    description: "Made-to-measure evening tuxedo styling for receptions and black-tie events.",
    basePrice: 18500,
    finalPrice: 18500,
    category: "Tailored",
    audience: "Party",
    sizes: ["Made to Measure"],
    colors: ["Black", "Ivory"],
    isFeatured: true,
    badge: "Custom",
    palette: "linear-gradient(135deg, #111827, #9ca3af)",
    discountPercentage: 0
  },
  {
    _id: "mock7",
    name: "Everyday Co-ord Set",
    description: "Relaxed matching separates with a clean silhouette for daily wear.",
    basePrice: 3200,
    finalPrice: 3200,
    category: "Casual Wear",
    audience: "Everyday",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Sage", "Cream"],
    isFeatured: false,
    badge: "Easy Wear",
    palette: "linear-gradient(135deg, #8ea58c, #f7efe5)",
    discountPercentage: 0
  },
  {
    _id: "mock8",
    name: "Embroidered Reception Lehenga",
    description: "Detailed lehenga with contemporary sparkle for wedding receptions.",
    basePrice: 24500,
    finalPrice: 24500,
    category: "Wedding Wear",
    audience: "Wedding",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Rose Gold", "Champagne"],
    isFeatured: true,
    badge: "Signature",
    palette: "linear-gradient(135deg, #b76e79, #f8e4c9)",
    discountPercentage: 0
  }
];

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
    appState.products = (apiProducts.length ? apiProducts : MOCK_PRODUCTS).map(normalizeProduct);
    renderProducts();
  } catch (error) {
    console.warn('API Failed, using Mock Products', error);
    appState.products = MOCK_PRODUCTS.map(normalizeProduct);
    renderProducts();
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
  appState.cart = appState.cart.filter((item) => item.productId !== productId);
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
    const cartCard = document.createElement('article');
    cartCard.className = 'cart-item';
    cartCard.innerHTML = `
      <div>
        <h3>${item.productName}</h3>
        <small>${item.size} • Qty ${item.quantity}</small>
        <p>${formatPrice(item.price)} each</p>
      </div>
      <div class="cart-item-actions">
        <button class="secondary-btn small remove-cart-btn" data-product-id="${item.productId}">Remove</button>
        <div class="quantity-control">
          <label>
            Qty
            <input type="number" min="1" value="${item.quantity}" class="cart-quantity-input" data-product-id="${item.productId}" />
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

  try {
    const orderData = {
      items: appState.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
      })),
      shippingAddress: {
        street: '123 Style Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
      },
    };

    const response = await api.createOrder(orderData);
    currentOrderId = response.data._id;

    // Show payment modal instead of just clearing cart
    paymentModal.hidden = false;
    closeCart();

    showNotification(`Order created! Please select payment method.`, 'success');
  } catch (error) {
    console.error('Checkout error:', error);
    currentOrderId = `demo_${Date.now()}`;
    paymentModal.hidden = false;
    closeCart();
    showNotification('Backend order storage is unavailable, continuing with demo checkout.', 'info');
  }
}

// ==================== PAYMENT HANDLING ====================

async function handleStripePayment() {
  stripePaymentForm.hidden = false;
  upiPaymentForm.hidden = true;

  try {
    if (!stripe || String(currentOrderId).startsWith('demo_')) {
      const submitButton = document.getElementById('submitStripePayment');
      submitButton.onclick = () => {
        showNotification('Processing demo card payment...', 'info');
        setTimeout(paymentComplete, 1000);
      };
      return;
    }

    const { clientSecret } = await api.createPaymentIntent(currentOrderId);

    const appearance = { theme: 'night', variables: { colorPrimary: '#d9c4a3' } };
    stripeElements = stripe.elements({ appearance, clientSecret });

    const paymentElement = stripeElements.create('payment');
    paymentElement.mount('#payment-element');

    document.getElementById('submitStripePayment').onclick = async () => {
      const { error } = await stripe.confirmPayment({
        elements: stripeElements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required'
      });

      if (error) {
        showNotification(error.message, 'error');
      } else {
        await api.confirmPayment(currentOrderId, 'stripe', 'pi_mock_' + Date.now());
        paymentComplete();
      }
    };
  } catch (error) {
    console.error('Stripe error:', error);
    showNotification('Failed to initialize Stripe', 'error');
  }
}

async function handleUPIPayment() {
  stripePaymentForm.hidden = true;
  upiPaymentForm.hidden = false;

  submitUPIPaymentBtn.onclick = async () => {
    const upiId = upiIdInput.value;
    if (!upiId) {
      showNotification('Please enter a valid UPI ID', 'warning');
      return;
    }

    try {
      if (String(currentOrderId).startsWith('demo_')) {
        showNotification('Demo UPI request sent. Completing payment...', 'info');
        setTimeout(paymentComplete, 1000);
        return;
      }

      await api.initiateUPIPayment(currentOrderId, upiId);
      showNotification('UPI request sent! Please check your UPI app.', 'info');

      // Simulate confirmation after 3 seconds for demo
      setTimeout(async () => {
        await api.confirmPayment(currentOrderId, 'upi', 'upi_mock_' + Date.now());
        paymentComplete();
      }, 3000);
    } catch (error) {
      showNotification('UPI initiation failed', 'error');
    }
  };
}

function paymentComplete() {
  appState.cart = [];
  saveStorage(STORAGE_KEYS.cart, appState.cart);
  updateCartDisplay();

  paymentModal.hidden = true;
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
          <strong>${order.orderNumber || 'ORD-' + order._id.slice(-6)}</strong>
          <span class="status status-${order.orderStatus}">${order.orderStatus}</span>
        </div>
        <p class="small">${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>${formatPrice(order.totalAmount)}</strong> (${order.items.length} items)</p>
      </div>
    `).join('');
  } catch (error) {
    ordersList.innerHTML = '<p class="error-text">Failed to load orders. Please try again later.</p>';
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

const MOCK_TIERS = [
  { _id: "t1", name: "Silver", discountPercentage: 5 },
  { _id: "t2", name: "Gold", discountPercentage: 10 },
  { _id: "t3", name: "Platinum", discountPercentage: 15 }
];

async function loadMembershipTiers() {
  try {
    const response = await api.getMembershipTiers();
    appState.membershipTiers = response.data || MOCK_TIERS;
  } catch (error) {
    appState.membershipTiers = MOCK_TIERS;
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
  });

  stripePaymentBtn.addEventListener('click', handleStripePayment);
  upiPaymentBtn.addEventListener('click', handleUPIPayment);

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
