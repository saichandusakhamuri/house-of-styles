const membershipBenefits = {
  silver: {
    name: "Silver Member",
    description: "Entry VIP access with shopping discounts and early previews.",
    fee: 0,
    formal: "10% OFF",
    wedding: "12% OFF",
    party: "8% OFF",
    casual: "6% OFF",
    benefitOneTitle: "Early Access",
    benefitOneText: "Preview select drops before public launch windows.",
    benefitTwoTitle: "Tailoring Priority",
    benefitTwoText: "Standard VIP priority in the custom stitching queue.",
    benefitThreeTitle: "Member Styling",
    benefitThreeText: "One curated style recommendation for every major season.",
  },
  gold: {
    name: "Gold Member",
    description: "Higher savings, stronger tailoring perks, and premium shopping support.",
    fee: 59,
    formal: "15% OFF",
    wedding: "18% OFF",
    party: "14% OFF",
    casual: "10% OFF",
    benefitOneTitle: "Drop Priority",
    benefitOneText: "Shop festive and occasion launches before regular members.",
    benefitTwoTitle: "Faster Tailoring",
    benefitTwoText: "Priority production slots for custom stitched outfits.",
    benefitThreeTitle: "Private Styling",
    benefitThreeText: "Quarterly one-on-one styling support with wardrobe suggestions.",
  },
  platinum: {
    name: "Platinum Member",
    description: "Maximum fashion privileges with the best discounts and elite service.",
    fee: 109,
    formal: "20% OFF",
    wedding: "25% OFF",
    party: "18% OFF",
    casual: "14% OFF",
    benefitOneTitle: "First Access",
    benefitOneText: "Be first in line for premium drops, wedding edits, and designer capsules.",
    benefitTwoTitle: "Express Tailoring",
    benefitTwoText: "Highest priority for made-to-measure orders and fitting support.",
    benefitThreeTitle: "Elite Concierge",
    benefitThreeText: "Dedicated VIP assistance for styling, orders, and event dressing.",
  },
};

const storageKeys = {
  currentCustomer: "houseOfTailor-current-customer",
  customers: "houseOfTailor-customers",
};

let pendingMembershipCustomer = null;
let pendingPaymentContext = null;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeMembershipStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value.includes("platinum")) return "platinum";
  if (value.includes("gold")) return "gold";
  if (value.includes("silver")) return "silver";

  return "silver";
}

function getMembershipPlan(status) {
  return membershipBenefits[normalizeMembershipStatus(status)];
}

function getMembershipPaymentStatus(status, paymentStatus) {
  const plan = getMembershipPlan(status);
  if (!plan.fee) {
    return "paid";
  }

  return paymentStatus === "paid" ? "paid" : "pending";
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

function formatMembershipLabel(status) {
  const normalized = normalizeMembershipStatus(status);
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} Member`;
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

function loadCustomerFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hasCustomerHint = params.has("email") || params.has("membershipStatus") || params.has("name");

  if (!hasCustomerHint) {
    return null;
  }

  return normalizeCustomer({
    name: params.get("name") || "Customer",
    email: params.get("email") || "",
    membershipStatus: params.get("membershipStatus") || "silver",
    membershipPaymentStatus: params.get("membershipPaymentStatus") || "pending",
  });
}

function loadCurrentCustomer() {
  const urlCustomer = loadCustomerFromUrl();

  try {
    const value = localStorage.getItem(storageKeys.currentCustomer);
    const storedCustomer = value ? normalizeCustomer(JSON.parse(value)) : null;

    if (urlCustomer && (!storedCustomer || storedCustomer.email === urlCustomer.email)) {
      return saveCurrentCustomer({
        ...storedCustomer,
        ...urlCustomer,
      });
    }

    return storedCustomer;
  } catch {
    return urlCustomer;
  }
}

function saveCurrentCustomer(customer) {
  const normalizedCustomer = normalizeCustomer(customer);
  if (!normalizedCustomer) {
    return null;
  }

  try {
    localStorage.setItem(storageKeys.currentCustomer, JSON.stringify(normalizedCustomer));

    const savedCustomers = localStorage.getItem(storageKeys.customers);
    const customers = savedCustomers ? JSON.parse(savedCustomers) : [];
    const index = customers.findIndex(
      (item) => normalizeEmail(item.email) === normalizedCustomer.email
    );

    if (index > -1) {
      customers[index] = {
        ...customers[index],
        ...normalizedCustomer,
      };
    } else {
      customers.unshift(normalizedCustomer);
    }

    localStorage.setItem(storageKeys.customers, JSON.stringify(customers));
  } catch {
    // Keep the page usable even if storage is unavailable.
  }

  return normalizedCustomer;
}

function getMembershipCatalog() {
  return Object.entries(membershipBenefits).map(([key, config]) => ({
    key,
    ...config,
  }));
}

function renderMembershipTiers(activeStatus = "silver", customer = null) {
  const container = document.getElementById("membershipTiersContainer");
  if (!container) {
    return;
  }

  const normalizedCustomer = normalizeCustomer(customer);
  const hasCustomer = Boolean(normalizedCustomer);
  const normalizedActiveStatus = normalizeMembershipStatus(activeStatus);

  container.innerHTML = getMembershipCatalog()
    .map((tier) => {
      const isActive = tier.key === normalizedActiveStatus;
      const isPendingPayment =
        hasCustomer && isActive && normalizedCustomer.membershipPaymentStatus === "pending";
      const buttonLabel = !hasCustomer
        ? "Open Store to Save"
        : isPendingPayment
          ? `Pay ${formatPrice(tier.fee)}`
          : isActive
            ? "Current Plan"
            : tier.fee
              ? `Choose ${formatPrice(tier.fee)}`
              : "Choose Free";

      return `
        <article class="tier-card${isActive ? " active" : ""}" data-tier-card="${tier.key}">
          <div class="tier-card-header">
            <span class="tier-badge">${tier.name}</span>
            <span class="tier-current">${isPendingPayment ? "Payment pending" : isActive ? "Current plan" : "Available"}</span>
          </div>
          <p class="tier-price">${tier.fee ? formatPrice(tier.fee) : "Free"}</p>
          <p class="tier-description">${tier.description}</p>
          <div class="tier-discount-list" aria-label="${tier.name} discounts">
            <div class="tier-discount-pill">
              <span>Formal</span>
              <strong>${tier.formal}</strong>
            </div>
            <div class="tier-discount-pill">
              <span>Wedding</span>
              <strong>${tier.wedding}</strong>
            </div>
            <div class="tier-discount-pill">
              <span>Party</span>
              <strong>${tier.party}</strong>
            </div>
            <div class="tier-discount-pill">
              <span>Casual</span>
              <strong>${tier.casual}</strong>
            </div>
          </div>
          <ul class="tier-benefit-list">
            <li>${tier.benefitOneText}</li>
            <li>${tier.benefitTwoText}</li>
            <li>${tier.benefitThreeText}</li>
          </ul>
          <button
            class="primary-btn full tier-select-btn"
            type="button"
            data-tier="${tier.key}"
            ${hasCustomer && isActive && !isPendingPayment ? "disabled" : ""}
          >
            ${buttonLabel}
          </button>
        </article>
      `;
    })
    .join("");
}

function updateMembershipView(status) {
  const config = membershipBenefits[normalizeMembershipStatus(status)];
  if (!config) {
    return;
  }

  document.getElementById("tierName").textContent = config.name;
  document.getElementById("tierDescription").textContent = config.description;
  document.getElementById("formalDiscount").textContent = config.formal;
  document.getElementById("weddingDiscount").textContent = config.wedding;
  document.getElementById("partyDiscount").textContent = config.party;
  document.getElementById("casualDiscount").textContent = config.casual;
  document.getElementById("extraBenefitOneTitle").textContent = config.benefitOneTitle;
  document.getElementById("extraBenefitOneText").textContent = config.benefitOneText;
  document.getElementById("extraBenefitTwoTitle").textContent = config.benefitTwoTitle;
  document.getElementById("extraBenefitTwoText").textContent = config.benefitTwoText;
  document.getElementById("extraBenefitThreeTitle").textContent = config.benefitThreeTitle;
  document.getElementById("extraBenefitThreeText").textContent = config.benefitThreeText;
}

function updateAccountView(customer) {
  const prompt = document.getElementById("vipSigninPrompt");
  const customerName = document.getElementById("customerName");
  const customerEmail = document.getElementById("customerEmail");
  const benefitsPanel = document.getElementById("vipBenefitsPanel");

  if (!prompt || !customerName || !customerEmail || !benefitsPanel) {
    return;
  }

  const normalizedCustomer = normalizeCustomer(customer);
  if (!normalizedCustomer) {
    customerName.textContent = "Guest User";
    customerEmail.textContent = "Please sign in to choose a VIP membership.";
    prompt.hidden = false;
    benefitsPanel.hidden = true;
    updateMembershipView("silver");
    renderMembershipTiers("silver", null);
    return;
  }

  customerName.textContent = normalizedCustomer.name || "Customer";
  customerEmail.textContent = `${normalizedCustomer.email} - ${formatMembershipSummary(normalizedCustomer)}`;
  prompt.hidden = true;
  benefitsPanel.hidden = false;
  updateMembershipView(normalizedCustomer.membershipStatus);
  renderMembershipTiers(normalizedCustomer.membershipStatus, normalizedCustomer);
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
  return {
    merchantName: String(config.merchantName || "House of Styles").trim(),
    merchantUpiId: String(config.merchantUpiId || config.upiId || "").trim(),
  };
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

function showUpiHandoff() {
  const stripePaymentForm = document.getElementById("stripePaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  if (stripePaymentForm) stripePaymentForm.hidden = true;
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
  const summaryTier = document.getElementById("summaryTier");
  const summaryDuration = document.getElementById("summaryDuration");
  const summaryAmount = document.getElementById("summaryAmount");
  const stripeLabel = paymentModal.querySelector("#stripePaymentBtn .payment-label");
  const upiLabel = paymentModal.querySelector("#upiPaymentBtn .payment-label");

  if (title) {
    title.textContent = "Activate VIP Membership";
  }

  if (summaryTier) {
    summaryTier.textContent = formatMembershipLabel(normalizedCustomer.membershipStatus);
  }

  if (summaryDuration) {
    summaryDuration.textContent = "One-time activation";
  }

  if (summaryAmount) {
    summaryAmount.textContent = formatPrice(plan.fee);
  }

  if (stripeLabel) {
    stripeLabel.textContent = "Card checkout unavailable";
  }

  if (upiLabel) {
    upiLabel.textContent = `Pay ${formatPrice(plan.fee)} by UPI`;
  }

  const stripePaymentForm = document.getElementById("stripePaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  resetPaymentInputs();
  if (stripePaymentForm) stripePaymentForm.hidden = true;
  if (upiPaymentForm) upiPaymentForm.hidden = true;
  setPaymentMessage("Choose a payment method to activate this membership.");
  updateUpiPaymentDetails(pendingPaymentContext);

  paymentModal.hidden = false;
  document.body.classList.add("drawer-open");
  return true;
}

function completeMembershipPayment(method) {
  const paymentContext = pendingPaymentContext;
  const customer = paymentContext?.customer || pendingMembershipCustomer;
  if (!customer) {
    return;
  }

  const activatedCustomer = saveCurrentCustomer({
    ...customer,
    membershipPaymentStatus: "paid",
    membershipPaymentMethod: method,
    membershipPaymentReference: paymentContext?.reference || createPaymentReference("VIP"),
    membershipPaidAt: new Date().toISOString(),
  });

  updateAccountView(activatedCustomer);
  const methodLabel = method === "upi" ? "UPI" : "card";
  setPaymentMessage(
    `Payment confirmation saved by ${methodLabel}. ${formatMembershipLabel(activatedCustomer.membershipStatus)} is now active.`,
    "success"
  );
  window.setTimeout(closeMembershipPaymentModal, 1800);
}

function bindTierActions() {
  const container = document.getElementById("membershipTiersContainer");
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const button = event.target.closest(".tier-select-btn");
    if (!button) {
      return;
    }

    const selectedTier = button.getAttribute("data-tier");
    if (!selectedTier) {
      return;
    }

    const currentCustomer = loadCurrentCustomer();
    if (!currentCustomer) {
      window.location.href = "index.html";
      return;
    }

    const normalizedTier = normalizeMembershipStatus(selectedTier);
    const updatedCustomer = saveCurrentCustomer({
      ...currentCustomer,
      membershipStatus: normalizedTier,
      membershipPaymentStatus: getMembershipPaymentStatus(normalizedTier, "pending"),
      membershipPaidAt: normalizedTier === "silver" ? new Date().toISOString() : "",
      membershipPaymentMethod: normalizedTier === "silver" ? "free" : "",
    });

    updateAccountView(updatedCustomer);

    if (membershipRequiresPayment(updatedCustomer)) {
      openMembershipPaymentModal(updatedCustomer);
    }
  });
}

function bindPaymentControls() {
  const closePaymentModalButton = document.getElementById("closePaymentModal");
  const stripePaymentButton = document.getElementById("stripePaymentBtn");
  const upiPaymentButton = document.getElementById("upiPaymentBtn");
  const stripePaymentForm = document.getElementById("stripePaymentForm");
  const upiPaymentForm = document.getElementById("upiPaymentForm");
  const openUPIAppButton = document.getElementById("openUPIAppButton");
  const confirmUPIPaymentButton = document.getElementById("confirmUPIPaymentButton");
  const copyUPILinkButton = document.getElementById("copyUPILinkButton");

  closePaymentModalButton?.addEventListener("click", closeMembershipPaymentModal);

  stripePaymentButton?.addEventListener("click", () => {
    if (stripePaymentForm) stripePaymentForm.hidden = false;
    if (upiPaymentForm) upiPaymentForm.hidden = true;
    setPaymentMessage(
      "Card checkout needs Stripe, Razorpay, or Cashfree connected before card details can be collected.",
      "error"
    );
  });

  upiPaymentButton?.addEventListener("click", showUpiHandoff);

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

    completeMembershipPayment("upi");
  });

  copyUPILinkButton?.addEventListener("click", copyUpiPaymentLink);
}

bindTierActions();
bindPaymentControls();
updateAccountView(loadCurrentCustomer());
