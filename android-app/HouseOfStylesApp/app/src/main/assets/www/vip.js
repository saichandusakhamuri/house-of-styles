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
};

function loadCurrentCustomer() {
  try {
    const value = localStorage.getItem(storageKeys.currentCustomer);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function formatMembershipLabel(status) {
  const normalized = status || "silver";
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} Member`;
}

function updateMembershipView(status) {
  const config = membershipBenefits[status];
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

  if (!customer) {
    customerName.textContent = "Guest User";
    customerEmail.textContent = "Please sign in to unlock your VIP pricing.";
    prompt.hidden = false;
    benefitsPanel.hidden = true;
    return;
  }

  customerName.textContent = customer.name || "Customer";
  customerEmail.textContent = `${customer.email} - ${formatMembershipLabel(customer.membershipStatus)}`;
  prompt.hidden = true;
  benefitsPanel.hidden = false;
  updateMembershipView(customer.membershipStatus || "silver");
}

updateAccountView(loadCurrentCustomer());
