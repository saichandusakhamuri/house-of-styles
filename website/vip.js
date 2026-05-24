const membershipBenefits = {
  silver: {
    name: "Silver Member",
    description: "Entry VIP access with shopping discounts and early previews.",
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

function normalizeMembershipStatus(status) {
  return membershipBenefits[status] ? status : "silver";
}

function loadCurrentCustomer() {
  try {
    const value = localStorage.getItem(storageKeys.currentCustomer);
    if (!value) {
      return null;
    }

    const customer = JSON.parse(value);
    return {
      ...customer,
      membershipStatus: normalizeMembershipStatus(customer.membershipStatus),
    };
  } catch {
    return null;
  }
}

function saveCurrentCustomer(customer) {
  const normalizedCustomer = {
    ...customer,
    membershipStatus: normalizeMembershipStatus(customer.membershipStatus),
  };

  try {
    localStorage.setItem(storageKeys.currentCustomer, JSON.stringify(normalizedCustomer));

    const savedCustomers = localStorage.getItem(storageKeys.customers);
    if (savedCustomers) {
      const customers = JSON.parse(savedCustomers);
      const index = customers.findIndex((item) => item.email === normalizedCustomer.email);

      if (index > -1) {
        customers[index] = {
          ...customers[index],
          ...normalizedCustomer,
        };

        localStorage.setItem(storageKeys.customers, JSON.stringify(customers));
      }
    }
  } catch {
    // Keep the page usable even if storage is unavailable.
  }

  return normalizedCustomer;
}

function formatMembershipLabel(status) {
  const normalized = normalizeMembershipStatus(status);
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} Member`;
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

  const hasCustomer = Boolean(customer);
  const normalizedActiveStatus = normalizeMembershipStatus(activeStatus);

  container.innerHTML = getMembershipCatalog()
    .map((tier) => {
      const isActive = tier.key === normalizedActiveStatus;
      const buttonLabel = !hasCustomer
        ? "Open Store to Save"
        : isActive
          ? "Current Plan"
          : "Set This Plan";

      return `
        <article class="tier-card${isActive ? " active" : ""}" data-tier-card="${tier.key}">
          <div class="tier-card-header">
            <span class="tier-badge">${tier.name}</span>
            <span class="tier-current">${isActive ? "Current plan" : "Available"}</span>
          </div>
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
            ${hasCustomer && isActive ? "disabled" : ""}
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

  if (!customer) {
    customerName.textContent = "Guest User";
    customerEmail.textContent = "Please sign in to unlock your VIP pricing.";
    prompt.hidden = false;
    benefitsPanel.hidden = true;
    updateMembershipView("silver");
    renderMembershipTiers("silver", null);
    return;
  }

  const normalizedCustomer = {
    ...customer,
    membershipStatus: normalizeMembershipStatus(customer.membershipStatus),
  };

  customerName.textContent = normalizedCustomer.name || "Customer";
  customerEmail.textContent = `${normalizedCustomer.email} - ${formatMembershipLabel(normalizedCustomer.membershipStatus)}`;
  prompt.hidden = true;
  benefitsPanel.hidden = false;
  updateMembershipView(normalizedCustomer.membershipStatus);
  renderMembershipTiers(normalizedCustomer.membershipStatus, normalizedCustomer);
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
    if (currentCustomer.membershipStatus === normalizedTier) {
      return;
    }

    const updatedCustomer = saveCurrentCustomer({
      ...currentCustomer,
      membershipStatus: normalizedTier,
    });

    updateAccountView(updatedCustomer);
  });
}

bindTierActions();
updateAccountView(loadCurrentCustomer());
