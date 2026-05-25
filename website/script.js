const products = [
  {
    id: 1,
    name: "Regal Ivory Sherwani",
    category: "Wedding Wear",
    audience: "Wedding",
    price: 8999,
    rating: 4.9,
    badge: "Best Seller",
    description: "Handsome wedding sherwani with textured layering and luxe finish.",
    sizes: ["M", "L", "XL"],
    palette: "linear-gradient(135deg, #d9c4a3, #8b5a36)",
  },
  {
    id: 2,
    name: "Rose Gold Reception Gown",
    category: "Party Wear",
    audience: "Party",
    price: 6499,
    rating: 4.8,
    badge: "New Drop",
    description: "Fluid eveningwear silhouette built for glam nights and reception dressing.",
    sizes: ["S", "M", "L"],
    palette: "linear-gradient(135deg, #e8b8b8, #804d52)",
  },
  {
    id: 3,
    name: "Tailored Linen Co-ord",
    category: "Casual Wear",
    audience: "Everyday",
    price: 2499,
    rating: 4.7,
    badge: "Easy Wear",
    description: "Breathable co-ord set with a sharp line and elevated comfort.",
    sizes: ["XS", "S", "M", "L"],
    palette: "linear-gradient(135deg, #d6d1bd, #67735b)",
  },
  {
    id: 4,
    name: "Festive Kurta Set",
    category: "Formal Wear",
    audience: "Festive",
    price: 3299,
    rating: 4.8,
    badge: "Festival Edit",
    description: "Smart festive kurta crafted for celebration dressing and repeat wear.",
    sizes: ["S", "M", "L", "XL"],
    palette: "linear-gradient(135deg, #e4c48d, #88471d)",
  },
  {
    id: 5,
    name: "Princess Twirl Occasion Set",
    category: "Party Wear",
    audience: "Party",
    price: 2199,
    rating: 4.9,
    badge: "Kids Pick",
    description: "Celebration-ready kidswear with comfort lining and playful movement.",
    sizes: ["3Y", "5Y", "7Y"],
    palette: "linear-gradient(135deg, #f1d4ea, #7d5672)",
  },
  {
    id: 6,
    name: "Custom Fit Power Blazer",
    category: "Formal Wear",
    audience: "Everyday",
    price: 5799,
    rating: 4.8,
    badge: "Made For You",
    description: "Semi-custom blazer ideal for work, events, and client-facing style.",
    sizes: ["Custom"],
    palette: "linear-gradient(135deg, #b4bcca, #30384a)",
  },
  {
    id: 7,
    name: "Pearl Pastel Lehenga",
    category: "Wedding Wear",
    audience: "Wedding",
    price: 11299,
    rating: 5,
    badge: "Bridal Edit",
    description: "Soft pastel lehenga layered with subtle embellishment and luxe drape.",
    sizes: ["S", "M", "L", "Custom"],
    palette: "linear-gradient(135deg, #efe1d3, #be8a70)",
  },
  {
    id: 8,
    name: "Signature Indo-Western Set",
    category: "Tailored",
    audience: "Festive",
    price: 4899,
    rating: 4.7,
    badge: "VIP Favorite",
    description: "Modern fusion look balancing statement styling with wearable structure.",
    sizes: ["M", "L", "Custom"],
    palette: "linear-gradient(135deg, #d4c3b2, #553b2a)",
  },
  {
    id: 9,
    name: "Midnight Formal Suit",
    category: "Formal Wear",
    audience: "Everyday",
    price: 6999,
    rating: 4.8,
    badge: "Office Edit",
    description: "Modern formal tailoring with clean structure for office and occasion crossover.",
    sizes: ["M", "L", "XL"],
    palette: "linear-gradient(135deg, #bbc2d0, #353b49)",
  },
  {
    id: 10,
    name: "Weekend Comfort Set",
    category: "Casual Wear",
    audience: "Everyday",
    price: 1899,
    rating: 4.6,
    badge: "Daily Wear",
    description: "Soft, relaxed casualwear designed for comfort without losing a styled look.",
    sizes: ["S", "M", "L", "XL"],
    palette: "linear-gradient(135deg, #d7c7b8, #7f6759)",
  },
  {
    id: 11,
    name: "Sequin Night Party Dress",
    category: "Party Wear",
    audience: "Party",
    price: 5399,
    rating: 4.8,
    badge: "Night Edit",
    description: "High-energy party statement with a sleek silhouette and luxe evening finish.",
    sizes: ["S", "M", "L"],
    palette: "linear-gradient(135deg, #d8b8c9, #644253)",
  },
];

const storageKeys = {
  cart: "houseOfTailor-cart",
  favorites: "houseOfTailor-favorites",
  vip: "houseOfTailor-vip-leads",
  custom: "houseOfTailor-custom-orders",
  customers: "houseOfTailor-customers",
  currentCustomer: "houseOfTailor-current-customer",
};

const state = {
  selectedCategory: "All",
  selectedPrice: "all",
  selectedAudience: "All",
  search: "",
  sort: "featured",
  cart: loadStorage(storageKeys.cart, []),
  favorites: loadStorage(storageKeys.favorites, []),
  vipLeads: loadStorage(storageKeys.vip, []),
  customOrders: loadStorage(storageKeys.custom, []),
  customers: loadStorage(storageKeys.customers, []),
  currentCustomer: loadStorage(storageKeys.currentCustomer, null),
  customStudio: {
    garment: "Blazer",
    occasion: "Wedding",
    fit: "Slim Fit",
    budget: "Rs 3000 - Rs 5000",
  },
};

const productGrid = document.getElementById("productGrid");
const productTemplate = document.getElementById("productCardTemplate");
const resultsText = document.getElementById("resultsText");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const favoritesCount = document.getElementById("favoritesCount");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const cartDrawer = document.getElementById("cartDrawer");
const accountModal = document.getElementById("accountModal");
const authModal = document.getElementById("authModal");

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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function findCustomerByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return state.customers.find((customer) => normalizeEmail(customer.email) === normalizedEmail);
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u20B9/g, "Rs ");
}

const membershipLabels = {
  silver: "Silver Member",
  gold: "Gold Member",
  platinum: "Platinum Member",
};

const membershipPlans = {
  silver: {
    fee: 0,
    paymentLabel: "Free",
  },
  gold: {
    fee: 59,
    paymentLabel: "Rs 59 activation",
  },
  platinum: {
    fee: 109,
    paymentLabel: "Rs 109 activation",
  },
};

let pendingMembershipCustomer = null;

function normalizeMembershipStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value.includes("platinum")) {
    return "platinum";
  }

  if (value.includes("gold")) {
    return "gold";
  }

  if (value.includes("silver")) {
    return "silver";
  }

  return "silver";
}

function getMembershipPlan(status) {
  return membershipPlans[normalizeMembershipStatus(status)];
}

function getMembershipPaymentStatus(status, paymentStatus) {
  const plan = getMembershipPlan(status);
  if (!plan.fee) {
    return "paid";
  }

  return paymentStatus === "paid" ? "paid" : "pending";
}

function formatMembershipLabel(status) {
  return membershipLabels[normalizeMembershipStatus(status)];
}

function formatMembershipSummary(customer) {
  const normalizedCustomer = normalizeCustomer(customer);
  if (!normalizedCustomer) {
    return "No membership selected";
  }

  if (normalizedCustomer.membershipPaymentStatus === "pending") {
    return `${formatMembershipLabel(normalizedCustomer.membershipStatus)} - payment pending`;
  }

  return `${formatMembershipLabel(normalizedCustomer.membershipStatus)} - active`;
}

function membershipRequiresPayment(customer) {
  const normalizedCustomer = normalizeCustomer(customer);
  return Boolean(
    normalizedCustomer &&
      getMembershipPlan(normalizedCustomer.membershipStatus).fee > 0 &&
      normalizedCustomer.membershipPaymentStatus !== "paid"
  );
}

function normalizeCustomer(customer) {
  if (!customer) {
    return null;
  }

  const membershipStatus = normalizeMembershipStatus(customer.membershipStatus);
  const plan = getMembershipPlan(membershipStatus);

  return {
    ...customer,
    email: normalizeEmail(customer.email),
    membershipStatus,
    membershipPaymentStatus: getMembershipPaymentStatus(
      membershipStatus,
      customer.membershipPaymentStatus
    ),
    membershipFee: plan.fee,
  };
}

function syncCurrentCustomer(customer) {
  const normalizedCustomer = normalizeCustomer(customer);
  if (!normalizedCustomer) {
    state.currentCustomer = null;
    localStorage.removeItem(storageKeys.currentCustomer);
    updateCustomerHeader();
    refreshVipLinks();
    return null;
  }

  state.currentCustomer = normalizedCustomer;
  saveStorage(storageKeys.currentCustomer, normalizedCustomer);

  const existingIndex = state.customers.findIndex(
    (item) => normalizeEmail(item.email) === normalizedCustomer.email
  );
  if (existingIndex > -1) {
    state.customers[existingIndex] = {
      ...state.customers[existingIndex],
      ...normalizedCustomer,
    };
  } else {
    state.customers.unshift(normalizedCustomer);
  }

  saveStorage(storageKeys.customers, state.customers);
  updateCustomerHeader();
  refreshVipLinks();
  return normalizedCustomer;
}

function getFirstName(name) {
  return String(name || "Customer").trim().split(/\s+/)[0] || "Customer";
}

function renderProfileSummary(customer = state.currentCustomer) {
  const profileSummary = document.getElementById("profileSummary");
  if (!profileSummary) {
    return;
  }

  if (!customer) {
    profileSummary.innerHTML = "";
    return;
  }

  profileSummary.innerHTML = `
    <article>
      <strong>${customer.name || "Customer"}</strong>
      <span>${customer.email || "No email saved"}</span>
    </article>
    <article>
      <strong>${formatMembershipSummary(customer)}</strong>
      <span>${customer.stylePreference || customer.interest || "Style preferences saved"}</span>
    </article>
  `;
}

function normalizeSavedCustomers() {
  state.customers = state.customers.map(normalizeCustomer).filter(Boolean);
  saveStorage(storageKeys.customers, state.customers);
}

function updateCustomerHeader() {
  const authButton = document.getElementById("openAuthModal");
  if (!authButton) {
    return;
  }

  const currentCustomer = normalizeCustomer(state.currentCustomer);
  if (!currentCustomer) {
    authButton.textContent = "Login / Sign Up";
    authButton.setAttribute("aria-label", "Login or sign up");
    renderProfileSummary(null);
    return;
  }

  authButton.textContent = `Hi, ${getFirstName(currentCustomer.name)}`;
  authButton.setAttribute(
    "aria-label",
    `Open account for ${currentCustomer.name || "customer"}, ${formatMembershipSummary(currentCustomer)}`
  );
  renderProfileSummary(currentCustomer);
}

function openCustomerAccount() {
  const currentCustomer = normalizeCustomer(state.currentCustomer);
  if (!currentCustomer) {
    openAuthModal();
    return;
  }

  openAccountModal(
    "Your Profile",
    `${currentCustomer.name || "Customer"}, you are signed in with ${formatMembershipSummary(currentCustomer)}.`
  );
  renderProfileSummary(currentCustomer);
}

function buildVipUrl(customer = state.currentCustomer) {
  const currentCustomer = normalizeCustomer(customer);
  if (!currentCustomer) {
    return "vip.html";
  }

  const params = new URLSearchParams({
    name: currentCustomer.name || "",
    email: currentCustomer.email || "",
    membershipStatus: normalizeMembershipStatus(currentCustomer.membershipStatus),
    membershipPaymentStatus: currentCustomer.membershipPaymentStatus,
    membershipFee: String(currentCustomer.membershipFee || 0),
  });

  return `vip.html?${params.toString()}`;
}

function refreshVipLinks() {
  document.querySelectorAll('a[href^="vip.html"]').forEach((link) => {
    link.setAttribute("href", buildVipUrl());
  });
}

function closeMembershipPaymentModal() {
  const paymentModal = document.getElementById("paymentModal");
  if (paymentModal) {
    paymentModal.hidden = true;
  }

  const stripePaymentForm = document.getElementById("stripePaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  if (stripePaymentForm) stripePaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = true;

  pendingMembershipCustomer = null;
  document.body.classList.remove("drawer-open");
}

function ensureMembershipPaymentSummary(paymentModal) {
  const body = paymentModal?.querySelector(".modal-body");
  if (!body) {
    return null;
  }

  let summary = body.querySelector(".membership-payment-summary");
  if (!summary) {
    summary = document.createElement("div");
    summary.className = "upgrade-summary membership-payment-summary";
    body.insertBefore(summary, body.firstChild);
  }

  return summary;
}

function openMembershipPaymentModal(customer) {
  const normalizedCustomer = normalizeCustomer(customer);
  if (!membershipRequiresPayment(normalizedCustomer)) {
    return false;
  }

  const paymentModal = document.getElementById("paymentModal");
  if (!paymentModal) {
    return false;
  }

  pendingMembershipCustomer = normalizedCustomer;
  const plan = getMembershipPlan(normalizedCustomer.membershipStatus);
  const title = paymentModal.querySelector(".drawer-header h2");
  const summary = ensureMembershipPaymentSummary(paymentModal);
  const stripeLabel = paymentModal.querySelector("#stripePaymentBtn .payment-label");
  const upiLabel = paymentModal.querySelector("#upiPaymentBtn .payment-label");

  if (title) {
    title.textContent = "Activate VIP Membership";
  }

  if (summary) {
    summary.innerHTML = `
      <h3>${formatMembershipLabel(normalizedCustomer.membershipStatus)}</h3>
      <p><strong>Subscription fee:</strong> ${formatPrice(plan.fee)}</p>
      <p class="form-note">This local payment marks the membership active on this device.</p>
    `;
  }

  if (stripeLabel) {
    stripeLabel.textContent = `Pay ${formatPrice(plan.fee)} by Card`;
  }

  if (upiLabel) {
    upiLabel.textContent = `Pay ${formatPrice(plan.fee)} by UPI`;
  }

  const stripePaymentForm = document.getElementById("stripePaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  if (stripePaymentForm) stripePaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = true;

  closeAccountModal();
  paymentModal.hidden = false;
  document.body.classList.add("drawer-open");
  return true;
}

function completeMembershipPayment(method) {
  if (!pendingMembershipCustomer) {
    return;
  }

  const activatedCustomer = syncCurrentCustomer({
    ...pendingMembershipCustomer,
    membershipPaymentStatus: "paid",
    membershipPaymentMethod: method,
    membershipPaidAt: new Date().toISOString(),
  });

  closeMembershipPaymentModal();
  openAccountModal(
    "Membership Active",
    `${activatedCustomer.name || "Customer"}, your ${formatMembershipLabel(activatedCustomer.membershipStatus)} is active.`
  );
  renderProfileSummary(activatedCustomer);
}

function getFilteredProducts() {
  const term = state.search.trim().toLowerCase();

  let filtered = products.filter((product) => {
    const categoryMatch =
      state.selectedCategory === "All" || product.category === state.selectedCategory;
    const audienceMatch =
      state.selectedAudience === "All" || product.audience === state.selectedAudience;

    const priceMatch =
      state.selectedPrice === "all" ||
      (state.selectedPrice === "under-2500" && product.price < 2500) ||
      (state.selectedPrice === "2500-5000" && product.price >= 2500 && product.price <= 5000) ||
      (state.selectedPrice === "above-5000" && product.price > 5000);

    const searchMatch =
      !term ||
      [product.name, product.category, product.audience, product.description]
        .join(" ")
        .toLowerCase()
        .includes(term);

    return categoryMatch && audienceMatch && priceMatch && searchMatch;
  });

  if (state.sort === "price-asc") {
    filtered = filtered.sort((a, b) => a.price - b.price);
  }

  if (state.sort === "price-desc") {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  productGrid.innerHTML = "";

  filtered.forEach((product) => {
    const fragment = productTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".product-card");
    const visual = fragment.querySelector(".product-visual");
    const badge = fragment.querySelector(".product-badge");
    const favoriteToggle = fragment.querySelector(".favorite-toggle");
    const category = fragment.querySelector(".product-category");
    const name = fragment.querySelector(".product-name");
    const description = fragment.querySelector(".product-description");
    const price = fragment.querySelector(".product-price");
    const rating = fragment.querySelector(".product-rating");
    const sizeRow = fragment.querySelector(".size-row");
    const addCartBtn = fragment.querySelector(".add-cart-btn");

    visual.style.setProperty("--product-background", product.palette);
    badge.textContent = product.badge;
    category.textContent = `${product.category} - ${product.audience}`;
    name.textContent = product.name;
    description.textContent = product.description;
    price.textContent = formatPrice(product.price);
    rating.textContent = `${product.rating} ★`;

    if (state.favorites.includes(product.id)) {
      favoriteToggle.classList.add("active");
      favoriteToggle.textContent = "Fav";
    }

    favoriteToggle.addEventListener("click", () => toggleFavorite(product.id));

    product.sizes.forEach((size) => {
      const chip = document.createElement("span");
      chip.className = "size-chip";
      chip.textContent = size;
      sizeRow.appendChild(chip);
    });

    addCartBtn.addEventListener("click", () => addToCart(product.id));
    card.dataset.productId = String(product.id);
    productGrid.appendChild(fragment);
  });

  resultsText.textContent = filtered.length
    ? `Showing ${filtered.length} product${filtered.length > 1 ? "s" : ""}`
    : "No products match these filters yet";
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const existing = state.cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1,
    });
  }

  persistCart();
  openCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  persistCart();
}

function toggleFavorite(productId) {
  if (state.favorites.includes(productId)) {
    state.favorites = state.favorites.filter((item) => item !== productId);
  } else {
    state.favorites.push(productId);
  }

  saveStorage(storageKeys.favorites, state.favorites);
  renderProducts();
  updateCounters();
}

function persistCart() {
  saveStorage(storageKeys.cart, state.cart);
  renderCart();
  updateCounters();
}

function renderCart() {
  cartItems.innerHTML = "";

  if (!state.cart.length) {
    const empty = document.createElement("div");
    empty.className = "cart-item";
    empty.innerHTML =
      "<div><h3>Your bag is empty</h3><p>Add a few signature pieces to begin your order.</p></div>";
    cartItems.appendChild(empty);
  }

  state.cart.forEach((item) => {
    const cartItem = document.createElement("article");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>${item.category}</p>
        <small>Qty ${item.quantity}</small>
      </div>
      <div>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
        <button class="ghost-btn small remove-item-btn" type="button">Remove</button>
      </div>
    `;

    cartItem.querySelector(".remove-item-btn").addEventListener("click", () => {
      removeFromCart(item.id);
    });

    cartItems.appendChild(cartItem);
  });

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);
}

function updateCounters() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = String(totalItems);
  favoritesCount.textContent = String(state.favorites.length);
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.hidden = false;
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.hidden = true;
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function openAccountModal(title, text) {
  document.getElementById("accountModalTitle").textContent = title;
  document.getElementById("accountModalText").textContent = text;
  accountModal.hidden = false;
  document.body.classList.add("drawer-open");
}

function closeAccountModal() {
  accountModal.hidden = true;
  document.body.classList.remove("drawer-open");
}

function openAuthModal() {
  authModal.hidden = false;
  document.body.classList.add("drawer-open");
}

function closeAuthModal() {
  authModal.hidden = true;
  document.body.classList.remove("drawer-open");
}

function showAuthForm(formName) {
  const targetForm =
    formName === "forgot"
      ? "forgotPasswordForm"
      : formName === "login"
        ? "customerLoginForm"
        : "customerSignupForm";

  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.toggle("active", form.id === targetForm);
  });

  document.querySelectorAll(".auth-tab").forEach((tab) => {
    const tabName = tab.getAttribute("data-auth-tab");
    tab.classList.toggle(
      "active",
      formName === "signup" ? tabName === "signup" : tabName === "login"
    );
  });
}

function applyCategoryFilter(category) {
  state.selectedCategory = category;
  setActiveButton("[data-category]", category, "category");
  renderProducts();
}

function bindFilters() {
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-category]")
        .forEach((element) => element.classList.remove("active"));
      button.classList.add("active");
      applyCategoryFilter(button.dataset.category || "All");
    });
  });

  document.querySelectorAll(".price-filter").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".price-filter")
        .forEach((element) => element.classList.remove("active"));
      button.classList.add("active");
      state.selectedPrice = button.dataset.price || "all";
      renderProducts();
    });
  });

  document.querySelectorAll(".audience-filter").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".audience-filter")
        .forEach((element) => element.classList.remove("active"));
      button.classList.add("active");
      state.selectedAudience = button.dataset.audience || "All";
      renderProducts();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  document.getElementById("sortSelect").addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  document.getElementById("clearFiltersButton").addEventListener("click", () => {
    state.selectedCategory = "All";
    state.selectedPrice = "all";
    state.selectedAudience = "All";
    state.search = "";
    state.sort = "featured";

    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "featured";
    setActiveButton("[data-category]", "All", "category");
    setActiveButton(".price-filter", "all", "price");
    setActiveButton(".audience-filter", "All", "audience");

    renderProducts();
  });
}

function bindShopDropdown() {
  const button = document.getElementById("shopMenuButton");
  const menu = document.getElementById("shopDropdownMenu");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", () => {
    const isHidden = menu.hasAttribute("hidden");
    if (isHidden) {
      menu.removeAttribute("hidden");
      button.setAttribute("aria-expanded", "true");
      return;
    }

    menu.setAttribute("hidden", "");
    button.setAttribute("aria-expanded", "false");
  });

  document.querySelectorAll("[data-category-shortcut]").forEach((item) => {
    item.addEventListener("click", () => {
      const category = item.getAttribute("data-category-shortcut") || "All";
      applyCategoryFilter(category);
      menu.setAttribute("hidden", "");
      button.setAttribute("aria-expanded", "false");
      document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.addEventListener("click", (event) => {
    if (!menu.hasAttribute("hidden") && !event.target.closest(".nav-dropdown")) {
      menu.setAttribute("hidden", "");
      button.setAttribute("aria-expanded", "false");
    }
  });
}

function setActiveButton(selector, value, type) {
  document.querySelectorAll(selector).forEach((button) => {
    let compare = "";
    if (type === "category") {
      compare = button.dataset.category;
    }
    if (type === "price") {
      compare = button.dataset.price;
    }
    if (type === "audience") {
      compare = button.dataset.audience;
    }

    button.classList.toggle("active", compare === value);
  });
}

function bindForms() {
  document.getElementById("vipForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entry = Object.fromEntries(formData.entries());
    entry.email = normalizeEmail(entry.email);
    entry.createdAt = new Date().toISOString();
    state.vipLeads.unshift(entry);
    saveStorage(storageKeys.vip, state.vipLeads);

    const matchingCustomer =
      normalizeEmail(state.currentCustomer?.email) === entry.email
        ? state.currentCustomer
        : state.customers.find((customer) => normalizeEmail(customer.email) === entry.email);

    if (matchingCustomer) {
      syncCurrentCustomer({
        ...matchingCustomer,
        interest: entry.interest,
      });
    }

    updateCounters();
    event.currentTarget.reset();
    document.getElementById("vipMessage").textContent =
      matchingCustomer
        ? `VIP interest saved for your ${formatMembershipLabel(matchingCustomer.membershipStatus)} profile.`
        : "VIP interest saved. Create or log in to a customer account to activate a membership plan.";
  });
}

function renderCustomStudioSummary() {
  if (!document.getElementById("customSummaryGarment")) {
    return;
  }

  document.getElementById("customSummaryGarment").textContent = state.customStudio.garment;
  document.getElementById("customSummaryOccasion").textContent = state.customStudio.occasion;
  document.getElementById("customSummaryFit").textContent = state.customStudio.fit;
  document.getElementById("customSummaryBudget").textContent = state.customStudio.budget;
}

function bindCustomStudio() {
  if (!document.getElementById("saveCustomStudioButton")) {
    return;
  }

  document.querySelectorAll("[data-custom-group]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.getAttribute("data-custom-group");
      const value = button.getAttribute("data-custom-value");

      if (!group || !value) {
        return;
      }

      state.customStudio[group] = value;

      document
        .querySelectorAll(`[data-custom-group="${group}"]`)
        .forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderCustomStudioSummary();
    });
  });

  document.getElementById("saveCustomStudioButton").addEventListener("click", () => {
    const entry = {
      ...state.customStudio,
      createdAt: new Date().toISOString(),
    };

    state.customOrders.unshift(entry);
    saveStorage(storageKeys.custom, state.customOrders);
    updateCounters();
    document.getElementById("customMessage").textContent =
      "Your custom style options have been saved. Next this can be connected to tailoring and checkout.";
  });

  renderCustomStudioSummary();
}

function bindCartControls() {
  document.getElementById("cartButton").addEventListener("click", openCart);
  document.getElementById("closeCartButton").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  document.getElementById("checkoutButton").addEventListener("click", () => {
    if (!state.cart.length) {
      alert("Your cart is empty right now.");
      return;
    }

    alert(
      "Checkout needs the live backend, order storage, and payment provider configuration."
    );
  });
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetSelector = button.getAttribute("data-scroll");
      const target = document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function bindAuthModal() {
  document.getElementById("openAuthModal").addEventListener("click", openCustomerAccount);
  document.getElementById("closeAuthModal").addEventListener("click", closeAuthModal);

  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
      closeAuthModal();
    }
  });

  document.querySelectorAll(".auth-tab").forEach((button) => {
    button.addEventListener("click", () => {
      showAuthForm(button.getAttribute("data-auth-tab") || "signup");
    });
  });
}

function bindLoginForms() {
  document.getElementById("customerSignupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entry = Object.fromEntries(formData.entries());
    entry.email = normalizeEmail(entry.email);

    const existingCustomer = findCustomerByEmail(entry.email);
    if (existingCustomer) {
      document.getElementById("customerSignupMessage").textContent =
        "An account already exists for this email. Please log in instead.";
      showAuthForm("login");
      document.querySelector('#customerLoginForm input[name="email"]').value = entry.email;
      return;
    }

    entry.createdAt = new Date().toISOString();
    entry.id = `cust-${Date.now()}`;
    entry.membershipStatus = normalizeMembershipStatus(entry.membershipStatus);
    const savedCustomer = syncCurrentCustomer(entry);
    document.getElementById("customerSignupMessage").textContent =
      `Customer account created for ${savedCustomer.name}.`;
    event.currentTarget.reset();
    closeAuthModal();

    if (membershipRequiresPayment(savedCustomer)) {
      openMembershipPaymentModal(savedCustomer);
    } else {
      openAccountModal(
        "Account Created",
        `${savedCustomer.name}, your ${formatMembershipLabel(savedCustomer.membershipStatus)} profile is active.`
      );
      renderProfileSummary(savedCustomer);
    }
  });

  document.getElementById("customerLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = normalizeEmail(formData.get("email"));
    const password = formData.get("password");
    const customer = findCustomerByEmail(email);

    if (!customer || customer.password !== password) {
      document.getElementById("customerLoginMessage").textContent =
        "No matching customer account found. Check your email and password.";
      return;
    }

    const savedCustomer = syncCurrentCustomer(customer);
    event.currentTarget.reset();
    closeAuthModal();
    document.getElementById("customerLoginMessage").textContent =
      `${savedCustomer.name}, login successful.`;
    openCustomerAccount();
  });

  document.getElementById("closeAccountModal").addEventListener("click", closeAccountModal);
  document.getElementById("confirmAccountModal").addEventListener("click", closeAccountModal);
  accountModal.addEventListener("click", (event) => {
    if (event.target === accountModal) {
      closeAccountModal();
    }
  });

  document.getElementById("forgotPasswordButton")?.addEventListener("click", () => {
    const loginEmail = document.querySelector('#customerLoginForm input[name="email"]')?.value || "";
    const resetEmail = document.querySelector('#forgotPasswordForm input[name="email"]');
    if (resetEmail) {
      resetEmail.value = loginEmail;
    }
    document.getElementById("passwordResetMessage").textContent =
      "Enter your local account email to check whether it exists on this device.";
    showAuthForm("forgot");
  });

  document.getElementById("backToLoginButton")?.addEventListener("click", () => {
    showAuthForm("login");
  });

  document.getElementById("forgotPasswordForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = normalizeEmail(formData.get("email"));
    const customer = findCustomerByEmail(email);
    const message = document.getElementById("passwordResetMessage");

    if (!customer) {
      message.textContent = "No local account was found for that email.";
      return;
    }

    message.textContent =
      "Account found. Since this prototype runs locally, please use the password created on this device.";
  });
}

function bindProfileActions() {
  document.querySelectorAll("[data-profile-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-profile-action");

      if (action === "cart") {
        closeAccountModal();
        openCart();
      }

      if (action === "membership") {
        window.location.href = buildVipUrl();
      }

      if (action === "custom") {
        window.location.href = "custom.html";
      }

      if (action === "favorites") {
        closeAccountModal();
        document.getElementById("favoritesButton")?.click();
      }

      if (action === "orders") {
        document.getElementById("accountModalText").textContent =
          "Order history will appear here after checkout is connected.";
      }

      if (action === "notifications") {
        document.getElementById("accountModalText").textContent =
          "Email, SMS, and VIP offer preferences are ready for the next backend connection.";
      }

      if (action === "logout") {
        syncCurrentCustomer(null);
        closeAccountModal();
      }
    });
  });
}

function bindMembershipPaymentControls() {
  const paymentModal = document.getElementById("paymentModal");
  const closePaymentModalButton = document.getElementById("closePaymentModal");
  const stripePaymentButton = document.getElementById("stripePaymentBtn");
  const upiPaymentButton = document.getElementById("upiPaymentBtn");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  const submitUPIPaymentButton = document.getElementById("submitUPIPayment");

  if (!paymentModal) {
    return;
  }

  closePaymentModalButton?.addEventListener("click", closeMembershipPaymentModal);

  stripePaymentButton?.addEventListener("click", () => {
    completeMembershipPayment("card");
  });

  upiPaymentButton?.addEventListener("click", () => {
    if (upiPaymentForm) {
      upiPaymentForm.hidden = false;
    }
  });

  submitUPIPaymentButton?.addEventListener("click", () => {
    const upiIdInput = document.getElementById("upiIdInput");
    if (upiIdInput && !upiIdInput.value.trim()) {
      upiIdInput.focus();
      return;
    }

    completeMembershipPayment("upi");
  });
}

function init() {
  closeAccountModal();
  closeAuthModal();
  normalizeSavedCustomers();
  state.currentCustomer = normalizeCustomer(state.currentCustomer);
  if (state.currentCustomer) {
    syncCurrentCustomer(state.currentCustomer);
  } else {
    updateCustomerHeader();
  }
  refreshVipLinks();
  renderProducts();
  renderCart();
  updateCounters();
  bindFilters();
  bindShopDropdown();
  bindForms();
  bindCustomStudio();
  bindCartControls();
  bindScrollButtons();
  bindAuthModal();
  bindLoginForms();
  bindProfileActions();
  bindMembershipPaymentControls();
}

init();
