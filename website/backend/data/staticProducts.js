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
