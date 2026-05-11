const customStudioStorageKey = "houseOfTailor-custom-studio-selection";

const customOptionCatalog = {
  garment: {
    Blazer: {
      title: "Choose a blazer model",
      description: "Pick the blazer direction that best fits your event and styling mood.",
      items: [
        { name: "Double-Breasted Signature", note: "Power shoulder and premium lapel line", visual: "custom-visual-blazer" },
        { name: "Minimal City Blazer", note: "Clean tailored shape for modern formalwear", visual: "custom-visual-formal" },
        { name: "Velvet Evening Blazer", note: "Soft shine for party and reception styling", visual: "custom-visual-party" },
        { name: "Relaxed Contemporary Blazer", note: "Sharper than casual, easier than classic", visual: "custom-visual-casual" }
      ]
    },
    Sherwani: {
      title: "Choose a sherwani model",
      description: "Explore groom and celebration silhouettes with different finishes.",
      items: [
        { name: "Royal Embroidered Sherwani", note: "Statement front work and heritage finish", visual: "custom-visual-sherwani" },
        { name: "Ivory Minimal Sherwani", note: "Elegant clean base for premium weddings", visual: "custom-visual-wedding" },
        { name: "Textured Layer Sherwani", note: "Depth, structure, and occasion richness", visual: "custom-visual-formal" },
        { name: "Indo-Western Sherwani", note: "Fusion styling with a fashion-led cut", visual: "custom-visual-party" }
      ]
    },
    Lehenga: {
      title: "Choose a lehenga model",
      description: "Select the lehenga mood that matches your wedding or festive look.",
      items: [
        { name: "Bridal Volume Lehenga", note: "Heavy flare and grand event presence", visual: "custom-visual-lehenga" },
        { name: "Pastel Modern Lehenga", note: "Soft tones and premium minimal detailing", visual: "custom-visual-wedding" },
        { name: "Reception Shine Lehenga", note: "Night-ready finish with richer highlights", visual: "custom-visual-party" },
        { name: "Light Festive Lehenga", note: "Comfort-forward style for long celebrations", visual: "custom-visual-casual" }
      ]
    },
    Dress: {
      title: "Choose a dress model",
      description: "Browse fitted, flowing, and statement dress directions.",
      items: [
        { name: "Structured Evening Dress", note: "Crisp shape with a premium finish", visual: "custom-visual-dress" },
        { name: "Soft Drape Dress", note: "Flowing silhouette with graceful movement", visual: "custom-visual-casual" },
        { name: "Cocktail Shine Dress", note: "Bold evening style for party dressing", visual: "custom-visual-party" },
        { name: "Occasion Luxe Dress", note: "Polished elegance for modern celebrations", visual: "custom-visual-wedding" }
      ]
    }
  },
  occasion: {
    Wedding: {
      title: "Choose a wedding style direction",
      description: "Find the wedding mood that best matches the look you want stitched.",
      items: [
        { name: "Royal Wedding Classic", note: "Traditional grandeur with ceremonial detail", visual: "custom-visual-wedding" },
        { name: "Pastel Luxury Wedding", note: "Soft palettes and premium contemporary tone", visual: "custom-visual-lehenga" },
        { name: "Reception Glam Wedding", note: "More shine and evening statement styling", visual: "custom-visual-party" },
        { name: "Minimal Elegant Wedding", note: "Subtle luxury with quieter refinement", visual: "custom-visual-formal" }
      ]
    },
    Formal: {
      title: "Choose a formal style direction",
      description: "Explore professional and polished custom styling routes.",
      items: [
        { name: "Boardroom Tailored", note: "Sharp structure and business-ready balance", visual: "custom-visual-formal" },
        { name: "Ceremony Formal", note: "Elevated formalwear with event presence", visual: "custom-visual-blazer" },
        { name: "Minimal Executive", note: "Crisp lines and understated authority", visual: "custom-visual-casual" },
        { name: "Evening Formal", note: "Dark luxe finish for premium formal nights", visual: "custom-visual-party" }
      ]
    },
    Party: {
      title: "Choose a party style direction",
      description: "Pick the energy and silhouette that fits your party look.",
      items: [
        { name: "Night Luxe Party", note: "High shine and statement texture", visual: "custom-visual-party" },
        { name: "Cocktail Minimal Party", note: "Clean and fashion-forward evening style", visual: "custom-visual-dress" },
        { name: "Bold Color Party", note: "Richer palettes and visual presence", visual: "custom-visual-lehenga" },
        { name: "Modern Fusion Party", note: "Contemporary cuts with event flexibility", visual: "custom-visual-sherwani" }
      ]
    },
    Casual: {
      title: "Choose a casual style direction",
      description: "See relaxed custom options with different comfort and polish levels.",
      items: [
        { name: "Smart Casual Ease", note: "Relaxed comfort with polished finishing", visual: "custom-visual-casual" },
        { name: "Weekend Tailored Casual", note: "Sharper than casual basics without stiffness", visual: "custom-visual-blazer" },
        { name: "Soft Everyday Casual", note: "Movement and breathability first", visual: "custom-visual-dress" },
        { name: "Premium Lounge Casual", note: "Easy wear with upscale material feel", visual: "custom-visual-formal" }
      ]
    }
  },
  fit: {
    "Slim Fit": {
      title: "Choose a slim fit profile",
      description: "Select the slim-fit version that best suits your body and comfort.",
      items: [
        { name: "Structured Slim", note: "Closer body line with sharp tailoring", visual: "custom-visual-formal" },
        { name: "Soft Slim", note: "Refined cut with easier movement", visual: "custom-visual-casual" },
        { name: "Tapered Event Slim", note: "Crisp party and occasion finish", visual: "custom-visual-party" },
        { name: "Wedding Slim Signature", note: "Lean ceremonial silhouette", visual: "custom-visual-wedding" }
      ]
    },
    "Classic Fit": {
      title: "Choose a classic fit profile",
      description: "Balance comfort and structure with these classic fit styles.",
      items: [
        { name: "Traditional Classic", note: "Reliable proportion and timeless line", visual: "custom-visual-formal" },
        { name: "Premium Classic", note: "A polished update to heritage fits", visual: "custom-visual-sherwani" },
        { name: "Occasion Classic", note: "Flexible comfort for longer events", visual: "custom-visual-wedding" },
        { name: "Dress Classic", note: "Soft drape with stable structure", visual: "custom-visual-dress" }
      ]
    },
    "Relaxed Fit": {
      title: "Choose a relaxed fit profile",
      description: "Explore looser custom cuts with cleaner styling.",
      items: [
        { name: "Modern Relaxed", note: "Extra ease with a styled finish", visual: "custom-visual-casual" },
        { name: "Relaxed Tailored", note: "Comfort-led shape that still feels premium", visual: "custom-visual-formal" },
        { name: "Flow Relaxed", note: "Movement-friendly silhouette", visual: "custom-visual-dress" },
        { name: "Fusion Relaxed", note: "Relaxed ceremonial styling", visual: "custom-visual-party" }
      ]
    },
    "Need Guidance": {
      title: "Choose a fit support route",
      description: "Tell the studio what kind of help you want with fit planning.",
      items: [
        { name: "Video Guidance Support", note: "Remote measuring help with easy instructions", visual: "custom-visual-formal" },
        { name: "Comfort First Consultation", note: "Fit focused on wearability and ease", visual: "custom-visual-casual" },
        { name: "Occasion Shape Guidance", note: "Fit planned around your event look", visual: "custom-visual-wedding" },
        { name: "Stylist Led Fit Advice", note: "A more fashion-led fit recommendation", visual: "custom-visual-party" }
      ]
    }
  },
  budget: {
    "Rs 3000 - Rs 5000": {
      title: "Choose an essential budget direction",
      description: "See custom routes that fit an entry premium budget.",
      items: [
        { name: "Essential Smart Finish", note: "Clean stitching with simple premium details", visual: "custom-visual-casual" },
        { name: "Minimal Formal Package", note: "Focused structure at a balanced price", visual: "custom-visual-formal" },
        { name: "Light Occasion Package", note: "Style lift without heavy embellishment", visual: "custom-visual-party" },
        { name: "Wedding Base Edit", note: "Entry event styling with cleaner surfaces", visual: "custom-visual-wedding" }
      ]
    },
    "Rs 5000 - Rs 10000": {
      title: "Choose a premium budget direction",
      description: "Explore stronger finishes, fabrics, and event styling options.",
      items: [
        { name: "Premium Tailored Edit", note: "Better shaping and fabric balance", visual: "custom-visual-formal" },
        { name: "Occasion Luxe Edit", note: "More visible detail and richer textures", visual: "custom-visual-party" },
        { name: "Wedding Premium Edit", note: "Richer event styling with refined finish", visual: "custom-visual-wedding" },
        { name: "Designer Casual Edit", note: "Elevated relaxed style with better drape", visual: "custom-visual-casual" }
      ]
    },
    "Rs 10000 - Rs 25000": {
      title: "Choose a luxury budget direction",
      description: "High-end options with deeper customization and styling impact.",
      items: [
        { name: "Luxury Formal Signature", note: "Sharper tailoring and richer construction", visual: "custom-visual-formal" },
        { name: "Celebration Luxury Edit", note: "Event-first premium styling", visual: "custom-visual-party" },
        { name: "Wedding Luxury Signature", note: "Heavier detail and stronger visual presence", visual: "custom-visual-wedding" },
        { name: "Fashion Forward Luxury", note: "Modern shape with premium expression", visual: "custom-visual-dress" }
      ]
    },
    "Rs 25000+": {
      title: "Choose an elite budget direction",
      description: "Top-tier custom routes for standout pieces and premium experiences.",
      items: [
        { name: "Couture Wedding Direction", note: "Highest finish for once-in-a-lifetime dressing", visual: "custom-visual-wedding" },
        { name: "Elite Formal Bespoke", note: "Boardroom-to-event bespoke premium build", visual: "custom-visual-formal" },
        { name: "Statement Party Couture", note: "Bold visual styling with richer detailing", visual: "custom-visual-party" },
        { name: "Designer Custom Signature", note: "Fashion-led one-of-one premium route", visual: "custom-visual-lehenga" }
      ]
    }
  }
};

function readSelection() {
  try {
    const saved = localStorage.getItem(customStudioStorageKey);
    return saved
      ? JSON.parse(saved)
      : {
          garment: "Blazer",
          occasion: "Wedding",
          fit: "Slim Fit",
          budget: "Rs 3000 - Rs 5000",
        };
  } catch {
    return {
      garment: "Blazer",
      occasion: "Wedding",
      fit: "Slim Fit",
      budget: "Rs 3000 - Rs 5000",
    };
  }
}

function saveSelection(group, value) {
  const current = readSelection();
  current[group] = value;
  current[`${group}Base`] = option;
  localStorage.setItem(customStudioStorageKey, JSON.stringify(current));
}

function renderGallery(group, option) {
  const groupData = customOptionCatalog[group];
  const optionData = groupData ? groupData[option] : null;
  const gallery = document.getElementById("customOptionsGallery");

  if (!gallery || !optionData) {
    return;
  }

  document.getElementById("customOptionsEyebrow").textContent = `${group} selection`;
  document.getElementById("customOptionsDescription").textContent = optionData.description;

  gallery.innerHTML = optionData.items
    .map(
      (item) => `
        <article class="custom-model-card">
          <div class="custom-model-visual ${item.visual}"></div>
          <div class="custom-model-copy">
            <h3>${item.name}</h3>
            <p>${item.note}</p>
            <button class="primary-btn full custom-model-select" type="button" data-model-value="${item.name}" data-model-group="${group}">
              Choose This Style
            </button>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".custom-model-select").forEach((button) => {
    button.addEventListener("click", () => {
      saveSelection(button.getAttribute("data-model-group"), button.getAttribute("data-model-value"));
      window.location.href = "custom.html";
    });
  });
}

const params = new URLSearchParams(window.location.search);
const group = params.get("group") || "garment";
const option = params.get("option") || "Blazer";
renderGallery(group, option);
