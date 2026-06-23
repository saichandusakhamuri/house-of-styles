const toDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const createFashionImageSet = (theme) =>
  ['front', 'detail', 'profile', 'flat', 'studio'].map((variant) =>
    toDataUri(createFashionSvg(theme, variant))
  );

function createFashionSvg(theme, variant) {
  const backdrop = {
    front: ['#f7efe7', '#d3b392'],
    detail: ['#f1e8dd', '#c28b5f'],
    profile: ['#f8f1eb', '#b98a60'],
    flat: ['#f6eee2', '#d8b9a0'],
    studio: ['#f4ece3', '#a56e45'],
  }[variant] || ['#f7efe7', '#d3b392'];

  const crop = {
    front: 'translate(0 8)',
    detail: 'translate(0 36) scale(1.02)',
    profile: 'translate(26 10) scale(0.96)',
    flat: 'translate(0 0) scale(0.98)',
    studio: 'translate(-6 16) scale(0.98)',
  }[variant] || 'translate(0 8)';

  const garment = {
    sherwani:
      '<path d="M352 214c22-12 58-12 80 0l42 32c13 10 19 28 15 44l-34 161c-3 16-17 27-33 27h-61c-16 0-30-11-33-27l-34-161c-4-16 2-34 15-44z" fill="{cloth}"/>' +
      '<path d="M382 258l18 178M418 258l-18 178" stroke="{accent}" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M370 254h60" stroke="{accent}" stroke-width="10" stroke-linecap="round"/>',
    gown:
      '<path d="M368 220c18-12 46-12 64 0l30 45c8 12 10 28 4 41l-41 90 35 136c3 15-8 29-23 29h-74c-15 0-26-14-23-29l35-136-41-90c-6-13-4-29 4-41z" fill="{cloth}"/>' +
      '<path d="M381 262c10 15 28 15 38 0" stroke="{accent}" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M394 260v220" stroke="{accent}" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 10"/>',
    coord:
      '<rect x="356" y="236" width="88" height="110" rx="18" fill="{cloth}"/>' +
      '<rect x="350" y="340" width="100" height="128" rx="24" fill="{accent}"/>' +
      '<path d="M370 236v232M430 236v232" stroke="{trim}" stroke-width="7" stroke-linecap="round"/>',
    kurta:
      '<path d="M370 222c13-10 47-10 60 0l32 34c10 10 15 24 13 38l-22 154c-2 15-15 26-30 26h-46c-15 0-28-11-30-26l-22-154c-2-14 3-28 13-38z" fill="{cloth}"/>' +
      '<path d="M400 222v210" stroke="{accent}" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M383 264h34M378 302h44M374 340h52" stroke="{trim}" stroke-width="6" stroke-linecap="round"/>',
    kids:
      '<path d="M374 232c15-9 37-9 52 0l26 30c8 9 11 21 8 33l-19 78 27 92c4 13-6 26-20 26h-91c-14 0-24-13-20-26l27-92-19-78c-3-12 0-24 8-33z" fill="{cloth}"/>' +
      '<path d="M400 246c18 26 18 26 36 0" stroke="{accent}" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M365 382h70" stroke="{trim}" stroke-width="7" stroke-linecap="round"/>',
    blazer:
      '<path d="M355 224c18-12 72-12 90 0l20 24 10 178c1 14-10 26-24 26h-102c-14 0-25-12-24-26l10-178z" fill="{cloth}"/>' +
      '<path d="M370 236l30 34 30-34M382 236l-18 42M418 236l18 42" stroke="{accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M400 270v158" stroke="{trim}" stroke-width="8" stroke-linecap="round"/>',
    lehenga:
      '<path d="M377 220c14-10 32-10 46 0l26 30c9 10 12 24 8 37l-16 58 52 118c6 13-4 28-19 28h-158c-15 0-25-15-19-28l52-118-16-58c-4-13-1-27 8-37z" fill="{cloth}"/>' +
      '<path d="M332 440h136M344 412h112M358 386h84" stroke="{accent}" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M400 220v95" stroke="{trim}" stroke-width="7" stroke-linecap="round"/>',
    indowestern:
      '<path d="M356 232c18-12 70-12 88 0l24 30c8 10 11 24 8 37l-18 107c-3 16-17 28-33 28h-50c-16 0-30-12-33-28l-18-107c-3-13 0-27 8-37z" fill="{cloth}"/>' +
      '<path d="M362 244l38 44 38-44M376 260c10 15 18 34 24 56 6-22 14-41 24-56" stroke="{accent}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M340 378h120" stroke="{trim}" stroke-width="7" stroke-linecap="round"/>',
  }[theme.look] || '';

  const decorations = {
    front:
      '<ellipse cx="400" cy="704" rx="166" ry="26" fill="rgba(56, 36, 20, 0.14)"/>' +
      '<path d="M400 160v414" stroke="{trim}" stroke-width="10" stroke-linecap="round"/>' +
      '<circle cx="400" cy="134" r="50" fill="{accent}" opacity="0.16"/>',
    detail:
      '<path d="M314 316h172" stroke="{accent}" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M330 350h140" stroke="{trim}" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 12"/>',
    profile:
      '<path d="M488 196c-34 2-68 22-82 52" stroke="{accent}" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="468" cy="698" rx="136" ry="20" fill="rgba(56, 36, 20, 0.12)"/>',
    flat:
      '<rect x="250" y="228" width="300" height="266" rx="36" fill="rgba(255,255,255,0.48)"/>' +
      '<path d="M284 282h232M284 344h232M284 406h232" stroke="{trim}" stroke-width="8" stroke-linecap="round" opacity="0.5"/>',
    studio:
      '<path d="M288 168h224" stroke="{trim}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>' +
      '<path d="M400 170v90" stroke="{trim}" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M324 260h152" stroke="{accent}" stroke-width="8" stroke-linecap="round" opacity="0.9"/>',
  }[variant] || '';

  const bg = `<defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${backdrop[0]}"/>
        <stop offset="100%" stop-color="${backdrop[1]}"/>
      </linearGradient>
      <linearGradient id="cloth" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.cloth1}"/>
        <stop offset="100%" stop-color="${theme.cloth2}"/>
      </linearGradient>
    </defs>`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${theme.label}">
      ${bg}
      <rect width="800" height="1000" fill="url(#bg)"/>
      <circle cx="162" cy="176" r="96" fill="${theme.accent}" opacity="0.1"/>
      <circle cx="632" cy="216" r="74" fill="${theme.trim}" opacity="0.08"/>
      <path d="M120 820h560" stroke="rgba(61,39,25,0.12)" stroke-width="8" stroke-linecap="round"/>
      <g transform="${crop}">
        <path d="M400 132c48 0 88 40 88 88s-40 88-88 88-88-40-88-88 40-88 88-88z" fill="${theme.trim}" opacity="0.16"/>
        <rect x="240" y="180" width="320" height="492" rx="48" fill="rgba(255,255,255,0.24)" stroke="rgba(92,58,34,0.08)"/>
        <g transform="translate(0 0)">
          <path d="M316 220c20-24 51-38 84-38s64 14 84 38l52 62-30 250c-4 28-28 49-56 49H350c-28 0-52-21-56-49l-30-250z" fill="rgba(255,255,255,0.18)"/>
          ${garment.replaceAll('{cloth}', 'url(#cloth)').replaceAll('{accent}', theme.accent).replaceAll('{trim}', theme.trim)}
          <circle cx="400" cy="194" r="58" fill="rgba(255,255,255,0.32)"/>
          <circle cx="400" cy="194" r="32" fill="${theme.accent}" opacity="0.14"/>
        </g>
        ${decorations.replaceAll('{accent}', theme.accent).replaceAll('{trim}', theme.trim)}
      </g>
    </svg>
  `;
}

const staticProducts = [
  {
    _id: '65f000000000000000000001',
    name: 'Regal Ivory Sherwani',
    description: 'Handsome wedding sherwani with textured layering and luxe finish.',
    category: 'Wedding Wear',
    audience: 'Wedding',
    basePrice: 8999,
    finalPrice: 8999,
    sizes: ['M', 'L', 'XL'],
    colors: ['Ivory', 'Gold'],
    stock: 20,
    rating: 4.9,
    isActive: true,
    isFeatured: true,
    badge: 'Best Seller',
    images: createFashionImageSet({
      label: 'Regal Ivory Sherwani',
      look: 'sherwani',
      cloth1: '#84502b',
      cloth2: '#c8a06f',
      accent: '#f8e8c9',
      trim: '#5f381f',
    }),
    palette: 'linear-gradient(135deg, #d9c4a3, #8b5a36)',
  },
  {
    _id: '65f000000000000000000002',
    name: 'Rose Gold Reception Gown',
    description: 'Fluid eveningwear silhouette built for glam nights and reception dressing.',
    category: 'Party Wear',
    audience: 'Party',
    basePrice: 6499,
    finalPrice: 6499,
    sizes: ['S', 'M', 'L'],
    colors: ['Rose Gold'],
    stock: 15,
    rating: 4.8,
    isActive: true,
    isFeatured: true,
    badge: 'New Drop',
    images: createFashionImageSet({
      label: 'Rose Gold Reception Gown',
      look: 'gown',
      cloth1: '#bb6e78',
      cloth2: '#f0c8cf',
      accent: '#fff0f4',
      trim: '#874b54',
    }),
    palette: 'linear-gradient(135deg, #e8b8b8, #804d52)',
  },
  {
    _id: '65f000000000000000000003',
    name: 'Tailored Linen Co-ord',
    description: 'Breathable co-ord set with a sharp line and elevated comfort.',
    category: 'Casual Wear',
    audience: 'Everyday',
    basePrice: 2499,
    finalPrice: 2499,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Sage', 'Cream'],
    stock: 60,
    rating: 4.7,
    isActive: true,
    isFeatured: false,
    badge: 'Easy Wear',
    images: createFashionImageSet({
      label: 'Tailored Linen Co-ord',
      look: 'coord',
      cloth1: '#7e8a68',
      cloth2: '#d8d2bb',
      accent: '#f7f4e8',
      trim: '#566145',
    }),
    palette: 'linear-gradient(135deg, #d6d1bd, #67735b)',
  },
  {
    _id: '65f000000000000000000004',
    name: 'Festive Kurta Set',
    description: 'Smart festive kurta crafted for celebration dressing and repeat wear.',
    category: 'Formal Wear',
    audience: 'Festive',
    basePrice: 3299,
    finalPrice: 3299,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Maroon', 'Ivory'],
    stock: 35,
    rating: 4.8,
    isActive: true,
    isFeatured: true,
    badge: 'Festival Edit',
    images: createFashionImageSet({
      label: 'Festive Kurta Set',
      look: 'kurta',
      cloth1: '#8a3b1f',
      cloth2: '#e3c06b',
      accent: '#fff2d6',
      trim: '#5f2713',
    }),
    palette: 'linear-gradient(135deg, #e4c48d, #88471d)',
  },
  {
    _id: '65f000000000000000000005',
    name: 'Princess Twirl Occasion Set',
    description: 'Celebration-ready kidswear with comfort lining and playful movement.',
    category: 'Party Wear',
    audience: 'Party',
    basePrice: 2199,
    finalPrice: 2199,
    sizes: ['3Y', '5Y', '7Y'],
    colors: ['Pink', 'Lavender'],
    stock: 40,
    rating: 4.9,
    isActive: true,
    isFeatured: false,
    badge: 'Kids Pick',
    images: createFashionImageSet({
      label: 'Princess Twirl Occasion Set',
      look: 'kids',
      cloth1: '#b565a7',
      cloth2: '#f1d2eb',
      accent: '#fff7fb',
      trim: '#7d4a72',
    }),
    palette: 'linear-gradient(135deg, #f1d4ea, #7d5672)',
  },
  {
    _id: '65f000000000000000000006',
    name: 'Custom Fit Power Blazer',
    description: 'Semi-custom blazer ideal for work, events, and client-facing style.',
    category: 'Formal Wear',
    audience: 'Everyday',
    basePrice: 5799,
    finalPrice: 5799,
    sizes: ['Custom'],
    colors: ['Navy', 'Charcoal'],
    stock: null,
    rating: 4.8,
    isActive: true,
    isFeatured: true,
    badge: 'Made For You',
    images: createFashionImageSet({
      label: 'Custom Fit Power Blazer',
      look: 'blazer',
      cloth1: '#354051',
      cloth2: '#abb6c7',
      accent: '#f6efea',
      trim: '#202633',
    }),
    palette: 'linear-gradient(135deg, #b4bcca, #30384a)',
  },
  {
    _id: '65f000000000000000000007',
    name: 'Pearl Pastel Lehenga',
    description: 'Soft pastel lehenga layered with subtle embellishment and luxe drape.',
    category: 'Wedding Wear',
    audience: 'Wedding',
    basePrice: 11299,
    finalPrice: 11299,
    sizes: ['S', 'M', 'L', 'Custom'],
    colors: ['Pearl', 'Pastel Pink'],
    stock: 12,
    rating: 5,
    isActive: true,
    isFeatured: true,
    badge: 'Bridal Edit',
    images: createFashionImageSet({
      label: 'Pearl Pastel Lehenga',
      look: 'lehenga',
      cloth1: '#d8a9a1',
      cloth2: '#f3e3cf',
      accent: '#fff7ef',
      trim: '#b77e6d',
    }),
    palette: 'linear-gradient(135deg, #efe1d3, #be8a70)',
  },
  {
    _id: '65f000000000000000000008',
    name: 'Signature Indo-Western Set',
    description: 'Modern fusion look balancing statement styling with wearable structure.',
    category: 'Tailored',
    audience: 'Festive',
    basePrice: 4899,
    finalPrice: 4899,
    sizes: ['M', 'L', 'Custom'],
    colors: ['Taupe', 'Coffee'],
    stock: 24,
    rating: 4.7,
    isActive: true,
    isFeatured: true,
    badge: 'VIP Favorite',
    images: createFashionImageSet({
      label: 'Signature Indo-Western Set',
      look: 'indowestern',
      cloth1: '#5b4235',
      cloth2: '#d3b79b',
      accent: '#f8efe5',
      trim: '#3b2b22',
    }),
    palette: 'linear-gradient(135deg, #d4c3b2, #553b2a)',
  },
];

const productMatches = (product, filters) => {
  if (!product.isActive) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.audience && product.audience !== filters.audience) return false;
  if (filters.isFeatured === 'true' && !product.isFeatured) return false;

  if (filters.search) {
    const term = filters.search.toLowerCase();
    const searchable = [product.name, product.description, product.category, product.audience]
      .join(' ')
      .toLowerCase();

    return searchable.includes(term);
  }

  return true;
};

const getStaticProducts = (filters = {}) => staticProducts.filter((product) => productMatches(product, filters));

const getStaticProductById = (id) => staticProducts.find((product) => product._id === id && product.isActive);

module.exports = {
  getStaticProductById,
  getStaticProducts,
  staticProducts,
};
