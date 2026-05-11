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

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u20B9/g, "Rs ");
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
    entry.createdAt = new Date().toISOString();
    state.vipLeads.unshift(entry);
    saveStorage(storageKeys.vip, state.vipLeads);
    updateCounters();
    event.currentTarget.reset();
    document.getElementById("vipMessage").textContent =
      "VIP interest saved. In the production version, this can sync to Firebase and your CRM.";
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
      "Checkout is in demo mode. Next step: connect Firebase auth, order storage, and Razorpay checkout."
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
  document.getElementById("openAuthModal").addEventListener("click", openAuthModal);
  document.getElementById("closeAuthModal").addEventListener("click", closeAuthModal);

  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
      closeAuthModal();
    }
  });

  document.querySelectorAll(".auth-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-auth-tab");
      document
        .querySelectorAll(".auth-tab")
        .forEach((item) => item.classList.toggle("active", item === button));
      document
        .querySelectorAll(".auth-form")
        .forEach((form) =>
          form.classList.toggle("active", form.id === (tab === "signup" ? "customerSignupForm" : "customerLoginForm"))
        );
    });
  });
}

function bindLoginForms() {
  document.getElementById("customerSignupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entry = Object.fromEntries(formData.entries());
    entry.createdAt = new Date().toISOString();
    entry.id = `cust-${Date.now()}`;
    state.customers.unshift(entry);
    saveStorage(storageKeys.customers, state.customers);
    state.currentCustomer = entry;
    saveStorage(storageKeys.currentCustomer, state.currentCustomer);
    document.getElementById("customerSignupMessage").textContent =
      `Customer account created for ${entry.name}.`;
    event.currentTarget.reset();
    closeAuthModal();
    openAccountModal(
      "Account Created",
      `${entry.name}, your customer account has been created in the prototype database and kept on this device. Next we can connect this to a real online database.`
    );
  });

  document.getElementById("customerLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const customer = state.customers.find(
      (item) => item.email === email && item.password === password
    );

    if (!customer) {
      document.getElementById("customerLoginMessage").textContent =
        "No matching customer account found. Check your email and password.";
      return;
    }

    state.currentCustomer = customer;
    saveStorage(storageKeys.currentCustomer, state.currentCustomer);
    event.currentTarget.reset();
    closeAuthModal();
    document.getElementById("customerLoginMessage").textContent =
      `${customer.name}, login successful.`;
  });

  document.getElementById("closeAccountModal").addEventListener("click", closeAccountModal);
  document.getElementById("confirmAccountModal").addEventListener("click", closeAccountModal);
  accountModal.addEventListener("click", (event) => {
    if (event.target === accountModal) {
      closeAccountModal();
    }
  });
}

function init() {
  closeAccountModal();
  closeAuthModal();
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
}

init();
