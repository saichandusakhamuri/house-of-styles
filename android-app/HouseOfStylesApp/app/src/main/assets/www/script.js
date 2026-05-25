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
  orders: "houseOfTailor-orders",
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
  orders: loadStorage(storageKeys.orders, []),
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
const favoritesDrawer = document.getElementById("favoritesDrawer");
const favoriteItems = document.getElementById("favoriteItems");
const favoritesTotal = document.getElementById("favoritesTotal");
const closeFavoritesButton = document.getElementById("closeFavoritesButton");
const browseFavoritesButton = document.getElementById("browseFavoritesButton");
const accountModal = document.getElementById("accountModal");
const authModal = document.getElementById("authModal");
const accountModalTitle = document.getElementById("accountModalTitle");
const accountModalText = document.getElementById("accountModalText");
const profileSummary = document.getElementById("profileSummary");
const profileActionsGroup = document.getElementById("profileActionsGroup");
const ordersSection = document.getElementById("ordersSection");
const ordersList = document.getElementById("ordersList");
const notificationsSection = document.getElementById("notificationsSection");
const notificationPreferencesForm = document.getElementById("notificationPreferencesForm");
const notificationPreferencesMessage = document.getElementById("notificationPreferencesMessage");

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
let pendingPaymentContext = null;

const defaultNotificationPreferences = {
  orderUpdates: true,
  vipOffers: true,
  newArrivals: true,
  customTailoring: true,
  email: true,
  sms: false,
  whatsapp: true,
};

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

function normalizeNotificationPreferences(preferences = {}) {
  return {
    orderUpdates: preferences.orderUpdates !== false,
    vipOffers: preferences.vipOffers !== false,
    newArrivals: preferences.newArrivals !== false,
    customTailoring: preferences.customTailoring !== false,
    email: preferences.email !== false,
    sms: Boolean(preferences.sms),
    whatsapp: preferences.whatsapp !== false,
  };
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
    notificationPreferences: normalizeNotificationPreferences(customer.notificationPreferences),
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
    <article>
      <strong>Notifications</strong>
      <span>${getNotificationPreferenceSummary(customer.notificationPreferences)}</span>
    </article>
  `;
}

function getNotificationPreferenceSummary(preferences) {
  const normalizedPreferences = normalizeNotificationPreferences(preferences);
  const activeTopics = [
    normalizedPreferences.orderUpdates,
    normalizedPreferences.vipOffers,
    normalizedPreferences.newArrivals,
    normalizedPreferences.customTailoring,
  ].filter(Boolean).length;
  const activeChannels = [
    normalizedPreferences.email,
    normalizedPreferences.sms,
    normalizedPreferences.whatsapp,
  ].filter(Boolean).length;

  return `${activeTopics} update types across ${activeChannels} channel${activeChannels === 1 ? "" : "s"}`;
}

function normalizeSavedCustomers() {
  state.customers = state.customers.map(normalizeCustomer).filter(Boolean);
  saveStorage(storageKeys.customers, state.customers);
}

function hydrateCustomerState() {
  const savedCustomer = normalizeCustomer(loadStorage(storageKeys.currentCustomer, null));

  if (savedCustomer) {
    syncCurrentCustomer(savedCustomer);
    return;
  }

  state.currentCustomer = null;
  updateCustomerHeader();
  refreshVipLinks();
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

  showProfilePanel();
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

  const gatewayPaymentForm = document.getElementById("gatewayPaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  if (gatewayPaymentForm) gatewayPaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = true;

  pendingMembershipCustomer = null;
  pendingPaymentContext = null;
  document.body.classList.remove("drawer-open");
}

function setPaymentMessage(message, type = "info") {
  const paymentMessage = document.getElementById("paymentMessage");
  if (!paymentMessage) {
    return;
  }

  paymentMessage.textContent = message;
  paymentMessage.classList.toggle("success", type === "success");
  paymentMessage.classList.toggle("error", type === "error");
}

function resetPaymentInputs() {
  updateUpiPaymentDetails(null);
}

function getPaymentConfig() {
  const config = window.HOS_CONFIG || {};
  const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");
  return {
    merchantName: String(config.merchantName || "House of Styles").trim(),
    merchantUpiId: String(config.merchantUpiId || config.upiId || "houseofstyles@upi").trim(),
    razorpayKeyId: String(config.razorpayKeyId || config.razorpayKey || "").trim(),
    razorpayOrderEndpoint: String(
      config.razorpayOrderEndpoint || (apiBaseUrl ? `${apiBaseUrl}/payments/razorpay-order` : "")
    ).trim(),
    razorpayVerifyEndpoint: String(
      config.razorpayVerifyEndpoint || (apiBaseUrl ? `${apiBaseUrl}/payments/razorpay-verify` : "")
    ).trim(),
  };
}

function formatPaymentMethodLabel(method, rail = "") {
  if (method === "card" && rail === "debit") return "Debit Card";
  if (method === "card") return "Credit Card";
  if (method === "netbanking") return "Netbanking";
  if (method === "upi") return rail === "direct" ? "Direct UPI" : "UPI Apps";
  return "Secure Checkout";
}

function createPaymentReference(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function formatUpiAmount(amount) {
  return Number(amount || 0).toFixed(2);
}

function buildUpiPaymentUrl(paymentContext = pendingPaymentContext) {
  const { merchantName, merchantUpiId } = getPaymentConfig();
  if (!paymentContext || !merchantUpiId) {
    return "";
  }

  const params = new URLSearchParams({
    pa: merchantUpiId,
    pn: merchantName,
    am: formatUpiAmount(paymentContext.amount),
    cu: "INR",
    tr: paymentContext.reference,
    tn: paymentContext.note,
  });

  return `upi://pay?${params.toString()}`;
}

function updateUpiPaymentDetails(paymentContext = pendingPaymentContext) {
  const { merchantName, merchantUpiId } = getPaymentConfig();
  const upiUrl = buildUpiPaymentUrl(paymentContext);
  const merchantValue = document.getElementById("upiMerchantValue");
  const amountValue = document.getElementById("upiAmountValue");
  const referenceValue = document.getElementById("upiReferenceValue");
  const openUPIAppButton = document.getElementById("openUPIAppButton");
  const confirmUPIPaymentButton = document.getElementById("confirmUPIPaymentButton");
  const copyUPILinkButton = document.getElementById("copyUPILinkButton");

  if (merchantValue) {
    merchantValue.textContent = merchantUpiId ? `${merchantName} (${merchantUpiId})` : "UPI ID not configured";
  }

  if (amountValue) {
    amountValue.textContent = paymentContext ? formatPrice(paymentContext.amount) : "Rs 0";
  }

  if (referenceValue) {
    referenceValue.textContent = paymentContext?.reference || "-";
  }

  if (openUPIAppButton) {
    openUPIAppButton.href = upiUrl || "#";
    openUPIAppButton.setAttribute("aria-disabled", upiUrl ? "false" : "true");
  }

  if (confirmUPIPaymentButton) {
    confirmUPIPaymentButton.disabled = !upiUrl;
  }

  if (copyUPILinkButton) {
    copyUPILinkButton.disabled = !upiUrl;
  }

  return upiUrl;
}

function updateGatewayPaymentDetails(paymentContext = pendingPaymentContext) {
  const gatewayMethodValue = document.getElementById("gatewayMethodValue");
  const gatewayAmountValue = document.getElementById("gatewayAmountValue");
  const gatewayReferenceValue = document.getElementById("gatewayReferenceValue");

  if (gatewayMethodValue) {
    gatewayMethodValue.textContent = formatPaymentMethodLabel(
      paymentContext?.gatewayMethod,
      paymentContext?.gatewayRail
    );
  }

  if (gatewayAmountValue) {
    gatewayAmountValue.textContent = paymentContext ? formatPrice(paymentContext.amount) : "Rs 0";
  }

  if (gatewayReferenceValue) {
    gatewayReferenceValue.textContent = paymentContext?.reference || "-";
  }
}

function showGatewayHandoff(method, rail) {
  if (!pendingPaymentContext) {
    return;
  }

  pendingPaymentContext.gatewayMethod = method;
  pendingPaymentContext.gatewayRail = rail;

  const gatewayPaymentForm = document.getElementById("gatewayPaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  if (gatewayPaymentForm) gatewayPaymentForm.hidden = false;
  if (upiPaymentForm) upiPaymentForm.hidden = true;

  updateGatewayPaymentDetails();

  const { razorpayKeyId, razorpayOrderEndpoint } = getPaymentConfig();
  if (!razorpayKeyId && !razorpayOrderEndpoint) {
    setPaymentMessage(
      "Razorpay is not configured yet. Add Razorpay backend keys to enable cards, netbanking, and UPI app checkout.",
      "error"
    );
    return;
  }

  setPaymentMessage(`${formatPaymentMethodLabel(method, rail)} is ready in secure checkout.`);
}

async function completeGatewayPayment(response = {}) {
  const paymentId = response.razorpay_payment_id || "";
  const method = pendingPaymentContext?.gatewayMethod || "gateway";
  const rail = pendingPaymentContext?.gatewayRail || "";
  const paymentMethod = formatPaymentMethodLabel(method, rail);

  try {
    setPaymentMessage("Verifying secure payment...");
    await verifyGatewayPayment(response);

    if (pendingPaymentContext?.type === "order") {
      completeOrderPayment(paymentMethod, paymentId);
      return;
    }

    completeMembershipPayment(paymentMethod, paymentId);
  } catch (error) {
    setPaymentMessage(error.message || "Secure payment could not be verified. Please contact support.", "error");
  }
}

function getGatewayDisplayConfig(method, rail) {
  return {
    config: {
      display: {
        blocks: {
          preferred: {
            name: formatPaymentMethodLabel(method, rail),
            instruments: [{ method }],
          },
        },
        sequence: ["block.preferred"],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
  };
}

async function createGatewayOrder() {
  const { razorpayOrderEndpoint } = getPaymentConfig();
  if (!razorpayOrderEndpoint) {
    throw new Error("Razorpay order endpoint is not configured.");
  }

  const response = await fetch(razorpayOrderEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(Number(pendingPaymentContext.amount || 0) * 100),
      currency: "INR",
      receipt: pendingPaymentContext.reference,
      notes: {
        reference: pendingPaymentContext.reference,
        type: pendingPaymentContext.type,
        method: formatPaymentMethodLabel(
          pendingPaymentContext.gatewayMethod,
          pendingPaymentContext.gatewayRail
        ),
      },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    throw new Error(body.message || "Razorpay order could not be created.");
  }

  return body;
}

async function verifyGatewayPayment(response = {}) {
  const { razorpayVerifyEndpoint } = getPaymentConfig();
  if (!razorpayVerifyEndpoint) {
    throw new Error("Razorpay verification endpoint is not configured.");
  }

  const verifyResponse = await fetch(razorpayVerifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      reference: pendingPaymentContext?.reference,
      type: pendingPaymentContext?.type,
      amount: Math.round(Number(pendingPaymentContext?.amount || 0) * 100),
    }),
  });

  const body = await verifyResponse.json().catch(() => ({}));
  if (!verifyResponse.ok || !body.success) {
    throw new Error(body.message || "Razorpay payment verification failed.");
  }

  return body;
}

async function openGatewayCheckout() {
  const { merchantName, razorpayKeyId, razorpayOrderEndpoint } = getPaymentConfig();

  if (!pendingPaymentContext) {
    return;
  }

  if (!razorpayKeyId && !razorpayOrderEndpoint) {
    setPaymentMessage(
      "Razorpay is not configured yet. Add Razorpay keys on the backend to open secure checkout.",
      "error"
    );
    return;
  }

  if (!window.Razorpay) {
    setPaymentMessage("Secure checkout could not load. Check the network connection and try again.", "error");
    return;
  }

  try {
    setPaymentMessage("Creating secure payment order...");
    const orderResponse = await createGatewayOrder();
    const order = orderResponse.order || {};
    const customer = normalizeCustomer(state.currentCustomer || pendingPaymentContext.customer);
    const method = pendingPaymentContext.gatewayMethod || "card";
    const description = pendingPaymentContext.note || "House of Styles payment";
    const checkout = new window.Razorpay({
      key: orderResponse.keyId || razorpayKeyId,
      amount: order.amount,
      currency: order.currency || "INR",
      order_id: order.id,
      name: merchantName,
      description,
      prefill: {
        name: customer?.name || "",
        email: customer?.email || "",
      },
      notes: {
        reference: pendingPaymentContext.reference,
        type: pendingPaymentContext.type,
        method: formatPaymentMethodLabel(method, pendingPaymentContext.gatewayRail),
      },
      ...getGatewayDisplayConfig(method, pendingPaymentContext.gatewayRail),
      handler: completeGatewayPayment,
      modal: {
        ondismiss() {
          setPaymentMessage("Secure checkout closed before payment was confirmed.", "error");
        },
      },
    });

    checkout.open();
    setPaymentMessage("Secure checkout opened. Complete the payment there.");
  } catch (error) {
    setPaymentMessage(error.message || "Secure checkout could not start.", "error");
  }
}

function showUpiHandoff() {
  if (pendingPaymentContext) {
    pendingPaymentContext.gatewayMethod = "upi";
    pendingPaymentContext.gatewayRail = "direct";
  }

  const gatewayPaymentForm = document.getElementById("gatewayPaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  if (gatewayPaymentForm) gatewayPaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = false;

  const upiUrl = updateUpiPaymentDetails();
  if (!upiUrl) {
    setPaymentMessage(
      "Merchant UPI ID is not configured yet. Add it to runtime-config.js before collecting live UPI payments.",
      "error"
    );
    return;
  }

  setPaymentMessage("UPI payment request is ready. Open the linked UPI app to pay the amount.");
}

async function copyUpiPaymentLink() {
  const upiUrl = updateUpiPaymentDetails();
  if (!upiUrl) {
    setPaymentMessage(
      "Merchant UPI ID is not configured yet. Add it to runtime-config.js before copying the payment link.",
      "error"
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(upiUrl);
    setPaymentMessage("UPI payment link copied.");
  } catch {
    setPaymentMessage("UPI payment link is ready, but this browser blocked clipboard access.", "error");
  }
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
  pendingPaymentContext = {
    type: "membership",
    amount: plan.fee,
    reference: normalizedCustomer.membershipPaymentReference || createPaymentReference("VIP"),
    note: `${formatMembershipLabel(normalizedCustomer.membershipStatus)} activation`,
    customer: normalizedCustomer,
  };

  const title = paymentModal.querySelector(".drawer-header h2");
  const summary = ensureMembershipPaymentSummary(paymentModal);
  const upiLabel = paymentModal.querySelector("#upiPaymentBtn .payment-label");

  if (title) {
    title.textContent = "Activate VIP Membership";
  }

  if (summary) {
    summary.innerHTML = `
      <h3>${formatMembershipLabel(normalizedCustomer.membershipStatus)}</h3>
      <p><strong>Subscription fee:</strong> ${formatPrice(plan.fee)}</p>
      <p><strong>Reference:</strong> ${pendingPaymentContext.reference}</p>
      <p class="form-note">Choose card, netbanking, UPI apps, or direct UPI to continue.</p>
    `;
  }

  if (upiLabel) {
    upiLabel.textContent = "Direct UPI";
  }

  const gatewayPaymentForm = document.getElementById("gatewayPaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  resetPaymentInputs();
  if (gatewayPaymentForm) gatewayPaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = true;
  setPaymentMessage("Choose a payment method to activate this membership.");
  updateUpiPaymentDetails(pendingPaymentContext);
  updateGatewayPaymentDetails(pendingPaymentContext);

  closeAccountModal();
  paymentModal.hidden = false;
  document.body.classList.add("drawer-open");
  return true;
}

function completeMembershipPayment(method, transactionId = "") {
  const paymentContext = pendingPaymentContext;
  const customer = paymentContext?.customer || pendingMembershipCustomer;
  if (!customer) {
    return;
  }

  const activatedCustomer = syncCurrentCustomer({
    ...customer,
    membershipPaymentStatus: "paid",
    membershipPaymentMethod: method,
    membershipPaymentReference: paymentContext?.reference || createPaymentReference("VIP"),
    membershipTransactionId: transactionId,
    membershipPaidAt: new Date().toISOString(),
  });

  setPaymentMessage(
    `Payment confirmation saved by ${method}. ${formatMembershipLabel(activatedCustomer.membershipStatus)} is now active.`,
    "success"
  );
  window.setTimeout(() => {
    closeMembershipPaymentModal();
    openAccountModal(
      "Membership Active",
      `${activatedCustomer.name || "Customer"}, your ${formatMembershipLabel(activatedCustomer.membershipStatus)} is active.`
    );
    renderProfileSummary(activatedCustomer);
  }, 800);
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
  renderFavoriteItems();
  updateCounters();
}

function removeFavorite(productId) {
  state.favorites = state.favorites.filter((item) => item !== productId);
  saveStorage(storageKeys.favorites, state.favorites);
  renderProducts();
  renderFavoriteItems();
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

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function saveOrders() {
  saveStorage(storageKeys.orders, state.orders);
}

function getCustomerOrders() {
  const customerEmail = normalizeEmail(state.currentCustomer?.email);
  if (!customerEmail) {
    return [];
  }

  return state.orders.filter((order) => normalizeEmail(order.customerEmail) === customerEmail);
}

function renderOrders() {
  if (!ordersList) {
    return;
  }

  const orders = getCustomerOrders();
  ordersList.innerHTML = "";

  if (!orders.length) {
    const empty = document.createElement("article");
    empty.className = "order-history-card";
    empty.innerHTML = "<h3>No orders yet</h3><p>Your paid and pending orders will appear here.</p>";
    ordersList.appendChild(empty);
    return;
  }

  orders.forEach((order) => {
    const isPaid = order.paymentStatus === "paid";
    const orderCard = document.createElement("article");
    orderCard.className = "order-history-card";
    orderCard.innerHTML = `
      <div class="header">
        <strong>${order.orderNumber}</strong>
        <span class="status ${isPaid ? "status-confirmed" : "status-pending"}">
          ${isPaid ? "Paid" : "Payment pending"}
        </span>
      </div>
      <p>${order.items.length} item${order.items.length === 1 ? "" : "s"} - ${formatPrice(order.total)}</p>
      <p class="form-note">Reference: ${order.paymentReference}</p>
      ${
        isPaid
          ? ""
          : '<button class="secondary-btn full mt-2 pay-order-btn" type="button">Pay Now</button>'
      }
    `;

    orderCard.querySelector(".pay-order-btn")?.addEventListener("click", () => {
      openOrderPaymentModal(order);
    });

    ordersList.appendChild(orderCard);
  });
}

function createOrderFromCart() {
  const currentCustomer = normalizeCustomer(state.currentCustomer);
  const orderNumber = `HOS-${Date.now().toString().slice(-6)}`;
  const paymentReference = createPaymentReference("ORDER");

  return {
    id: `order-${Date.now()}`,
    orderNumber,
    customerEmail: currentCustomer.email,
    customerName: currentCustomer.name || "Customer",
    items: state.cart.map((item) => ({ ...item })),
    total: getCartTotal(),
    status: "payment_pending",
    paymentStatus: "pending",
    paymentMethod: "",
    paymentReference,
    createdAt: new Date().toISOString(),
  };
}

function startOrderCheckout() {
  if (!state.cart.length) {
    alert("Your cart is empty right now.");
    return;
  }

  if (!state.currentCustomer) {
    closeCart();
    openAuthModal();
    document.getElementById("customerSignupMessage").textContent =
      "Create or log in to an account before placing an order.";
    return;
  }

  const order = createOrderFromCart();
  state.orders.unshift(order);
  saveOrders();
  renderOrders();
  closeCart();
  openOrderPaymentModal(order);
}

function openOrderPaymentModal(order) {
  const paymentModal = document.getElementById("paymentModal");
  if (!paymentModal || !order) {
    return;
  }

  pendingPaymentContext = {
    type: "order",
    amount: order.total,
    reference: order.paymentReference,
    note: `Order ${order.orderNumber}`,
    orderId: order.id,
  };

  const title = paymentModal.querySelector(".drawer-header h2");
  const summary = ensureMembershipPaymentSummary(paymentModal);
  const upiLabel = paymentModal.querySelector("#upiPaymentBtn .payment-label");
  const gatewayPaymentForm = document.getElementById("gatewayPaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");

  if (title) {
    title.textContent = "Pay for Order";
  }

  if (summary) {
    summary.innerHTML = `
      <h3>${order.orderNumber}</h3>
      <p><strong>Items:</strong> ${order.items.length}</p>
      <p><strong>Amount:</strong> ${formatPrice(order.total)}</p>
      <p><strong>Reference:</strong> ${order.paymentReference}</p>
      <p class="form-note">Choose card, netbanking, UPI apps, or direct UPI to continue.</p>
    `;
  }

  if (upiLabel) {
    upiLabel.textContent = "Direct UPI";
  }

  if (gatewayPaymentForm) gatewayPaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = true;
  setPaymentMessage("Choose a payment method for this order.");
  updateUpiPaymentDetails(pendingPaymentContext);
  updateGatewayPaymentDetails(pendingPaymentContext);

  closeAccountModal();
  paymentModal.hidden = false;
  document.body.classList.add("drawer-open");
}

function completeOrderPayment(method, transactionId = "") {
  if (pendingPaymentContext?.type !== "order") {
    return;
  }

  const orderId = pendingPaymentContext.orderId;
  state.orders = state.orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status: "payment_confirmed",
          paymentStatus: "paid",
          paymentMethod: method,
          transactionId,
          paidAt: new Date().toISOString(),
        }
      : order
  );
  saveOrders();
  state.cart = [];
  persistCart();
  renderOrders();
  setPaymentMessage("Payment confirmation saved for this order.", "success");
  window.setTimeout(closeMembershipPaymentModal, 900);
}

function updateCounters() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = String(totalItems);
  favoritesCount.textContent = String(state.favorites.length);
  if (favoritesTotal) {
    favoritesTotal.textContent = `${state.favorites.length} item${state.favorites.length === 1 ? "" : "s"}`;
  }
}

function syncDrawerOverlay() {
  const isCartOpen = cartDrawer.classList.contains("open");
  const isFavoritesOpen = favoritesDrawer?.classList.contains("open");
  overlay.hidden = !isCartOpen && !isFavoritesOpen;
  document.body.classList.toggle("drawer-open", isCartOpen || isFavoritesOpen);
}

function openCart() {
  closeFavorites();
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  syncDrawerOverlay();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  syncDrawerOverlay();
}

function renderFavoriteItems() {
  if (!favoriteItems) {
    return;
  }

  favoriteItems.innerHTML = "";

  const savedProducts = state.favorites
    .map((productId) => products.find((product) => product.id === productId))
    .filter(Boolean);

  if (!savedProducts.length) {
    const empty = document.createElement("div");
    empty.className = "cart-item";
    empty.innerHTML =
      "<div><h3>No saved styles yet</h3><p>Tap Fav on any product to keep it here.</p></div>";
    favoriteItems.appendChild(empty);
    return;
  }

  savedProducts.forEach((product) => {
    const favoriteItem = document.createElement("article");
    favoriteItem.className = "cart-item";
    favoriteItem.innerHTML = `
      <div>
        <h3>${product.name}</h3>
        <p>${product.category} - ${product.audience}</p>
        <small>${formatPrice(product.price)}</small>
      </div>
      <div class="cart-item-actions">
        <button class="primary-btn small add-favorite-cart-btn" type="button">Add to Cart</button>
        <button class="ghost-btn small remove-favorite-btn" type="button">Remove</button>
      </div>
    `;

    favoriteItem.querySelector(".add-favorite-cart-btn").addEventListener("click", () => {
      addToCart(product.id);
    });

    favoriteItem.querySelector(".remove-favorite-btn").addEventListener("click", () => {
      removeFavorite(product.id);
    });

    favoriteItems.appendChild(favoriteItem);
  });
}

function openFavorites() {
  if (!favoritesDrawer) {
    return;
  }

  closeCart();
  renderFavoriteItems();
  favoritesDrawer.classList.add("open");
  favoritesDrawer.setAttribute("aria-hidden", "false");
  syncDrawerOverlay();
}

function closeFavorites() {
  if (!favoritesDrawer) {
    return;
  }

  favoritesDrawer.classList.remove("open");
  favoritesDrawer.setAttribute("aria-hidden", "true");
  syncDrawerOverlay();
}

function openAccountModal(title, text) {
  accountModalTitle.textContent = title;
  accountModalText.textContent = text;
  accountModal.hidden = false;
  document.body.classList.add("drawer-open");
}

function closeAccountModal() {
  accountModal.hidden = true;
  document.body.classList.remove("drawer-open");
  showProfilePanel();
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

function showProfilePanel() {
  if (profileSummary) profileSummary.hidden = false;
  if (profileActionsGroup) profileActionsGroup.hidden = false;
  if (ordersSection) ordersSection.hidden = true;
  if (notificationsSection) notificationsSection.hidden = true;
  if (accountModalTitle) accountModalTitle.textContent = "Your Profile";
  if (accountModalText && state.currentCustomer) {
    accountModalText.textContent = `${state.currentCustomer.name || "Customer"}, you are signed in with ${formatMembershipSummary(state.currentCustomer)}.`;
  }
}

function showOrdersPanel() {
  if (profileSummary) profileSummary.hidden = true;
  if (profileActionsGroup) profileActionsGroup.hidden = true;
  if (ordersSection) ordersSection.hidden = false;
  if (notificationsSection) notificationsSection.hidden = true;
  if (accountModalTitle) accountModalTitle.textContent = "Order History";
  if (accountModalText) {
    accountModalText.textContent = "Review paid and pending orders for this customer profile.";
  }
  renderOrders();
}

function renderNotificationPreferences(customer = state.currentCustomer) {
  if (!notificationPreferencesForm) {
    return;
  }

  const normalizedPreferences = normalizeNotificationPreferences(
    normalizeCustomer(customer)?.notificationPreferences
  );

  Object.entries(normalizedPreferences).forEach(([key, value]) => {
    const input = notificationPreferencesForm.elements.namedItem(key);
    if (input) {
      input.checked = value;
    }
  });

  if (notificationPreferencesMessage) {
    notificationPreferencesMessage.textContent =
      "Preferences are stored with your local customer profile on this device.";
  }
}

function showNotificationsPanel() {
  if (profileSummary) profileSummary.hidden = true;
  if (profileActionsGroup) profileActionsGroup.hidden = true;
  if (ordersSection) ordersSection.hidden = true;
  if (notificationsSection) notificationsSection.hidden = false;
  if (accountModalTitle) accountModalTitle.textContent = "Notification Preferences";
  if (accountModalText) {
    accountModalText.textContent = "Control the updates and channels tied to your customer profile.";
  }
  renderNotificationPreferences();
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
  document.getElementById("favoritesButton")?.addEventListener("click", openFavorites);
  closeFavoritesButton?.addEventListener("click", closeFavorites);
  browseFavoritesButton?.addEventListener("click", () => {
    closeFavorites();
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  overlay.addEventListener("click", () => {
    closeCart();
    closeFavorites();
  });

  document.getElementById("checkoutButton").addEventListener("click", startOrderCheckout);
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
  document.getElementById("backToProfileBtn")?.addEventListener("click", showProfilePanel);
  document.getElementById("backFromNotificationsButton")?.addEventListener("click", showProfilePanel);
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

  notificationPreferencesForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!state.currentCustomer) {
      showProfilePanel();
      return;
    }

    const formData = new FormData(notificationPreferencesForm);
    const updatedCustomer = syncCurrentCustomer({
      ...state.currentCustomer,
      notificationPreferences: {
        orderUpdates: formData.has("orderUpdates"),
        vipOffers: formData.has("vipOffers"),
        newArrivals: formData.has("newArrivals"),
        customTailoring: formData.has("customTailoring"),
        email: formData.has("email"),
        sms: formData.has("sms"),
        whatsapp: formData.has("whatsapp"),
      },
    });

    renderProfileSummary(updatedCustomer);
    renderNotificationPreferences(updatedCustomer);
    if (notificationPreferencesMessage) {
      notificationPreferencesMessage.textContent = "Notification preferences saved for this customer profile.";
    }
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
        openFavorites();
      }

      if (action === "orders") {
        showOrdersPanel();
      }

      if (action === "notifications") {
        showNotificationsPanel();
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
  const creditCardPaymentButton = document.getElementById("creditCardPaymentBtn");
  const debitCardPaymentButton = document.getElementById("debitCardPaymentBtn");
  const netbankingPaymentButton = document.getElementById("netbankingPaymentBtn");
  const gatewayUPIPaymentButton = document.getElementById("gatewayUPIPaymentBtn");
  const upiPaymentButton = document.getElementById("upiPaymentBtn");
  const openUPIAppButton = document.getElementById("openUPIAppButton");
  const openGatewayCheckoutButton = document.getElementById("openGatewayCheckoutButton");
  const confirmUPIPaymentButton = document.getElementById("confirmUPIPaymentButton");
  const copyUPILinkButton = document.getElementById("copyUPILinkButton");

  if (!paymentModal) {
    return;
  }

  closePaymentModalButton?.addEventListener("click", closeMembershipPaymentModal);

  creditCardPaymentButton?.addEventListener("click", () => showGatewayHandoff("card", "credit"));
  debitCardPaymentButton?.addEventListener("click", () => showGatewayHandoff("card", "debit"));
  netbankingPaymentButton?.addEventListener("click", () => showGatewayHandoff("netbanking"));
  gatewayUPIPaymentButton?.addEventListener("click", () => showGatewayHandoff("upi", "apps"));
  upiPaymentButton?.addEventListener("click", showUpiHandoff);
  openGatewayCheckoutButton?.addEventListener("click", openGatewayCheckout);

  openUPIAppButton?.addEventListener("click", (event) => {
    const upiUrl = updateUpiPaymentDetails();
    if (!upiUrl) {
      event.preventDefault();
      setPaymentMessage(
        "Merchant UPI ID is not configured yet. Add it to runtime-config.js before collecting live UPI payments.",
        "error"
      );
      return;
    }

    setPaymentMessage("UPI app opened. Complete the payment there, then return and confirm.");
  });

  confirmUPIPaymentButton?.addEventListener("click", () => {
    if (!updateUpiPaymentDetails()) {
      setPaymentMessage(
        "Merchant UPI ID is not configured yet. Add it to runtime-config.js before confirming UPI payments.",
        "error"
      );
      return;
    }

    if (pendingPaymentContext?.type === "order") {
      completeOrderPayment("Direct UPI");
      return;
    }

    completeMembershipPayment("Direct UPI");
  });

  copyUPILinkButton?.addEventListener("click", copyUpiPaymentLink);
}

function init() {
  closeAccountModal();
  closeAuthModal();
  closeFavorites();
  showProfilePanel();
  normalizeSavedCustomers();
  hydrateCustomerState();
  refreshVipLinks();
  renderProducts();
  renderCart();
  renderFavoriteItems();
  renderOrders();
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
  window.addEventListener("pageshow", hydrateCustomerState);
  window.addEventListener("focus", hydrateCustomerState);
}

init();
