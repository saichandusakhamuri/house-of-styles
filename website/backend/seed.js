require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const MembershipTier = require('./models/MembershipTier');
const User = require('./models/User');

const products = [
  {
    name: 'Classic Navy Blazer',
    description: 'Tailored fit navy blue blazer for professional settings.',
    category: 'Formal Wear',
    audience: 'Everyday',
    basePrice: 4500,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy Blue'],
    stock: 50,
    isActive: true,
    isFeatured: true,
    badge: 'Bestseller',
    palette: 'linear-gradient(135deg, #2c3e50, #000000)',
  },
  {
    name: 'Regal Wedding Sherwani',
    description: 'Gold embroidered sherwani for premium wedding styling.',
    category: 'Wedding Wear',
    audience: 'Wedding',
    basePrice: 12500,
    sizes: ['M', 'L', 'XL'],
    colors: ['Gold', 'Cream'],
    stock: 20,
    isActive: true,
    isFeatured: true,
    badge: 'Premium',
    palette: 'linear-gradient(135deg, #d4af37, #8b4513)',
  },
  {
    name: 'Elegant Evening Gown',
    description: 'Flowing silk dress designed for evening movement.',
    category: 'Party Wear',
    audience: 'Party',
    basePrice: 8900,
    sizes: ['XS', 'S', 'M'],
    colors: ['Emerald Green', 'Midnight Black'],
    stock: 15,
    isActive: true,
    isFeatured: true,
    badge: 'New',
    palette: 'linear-gradient(135deg, #004d40, #000000)',
  },
  {
    name: 'Casual Linen Shirt',
    description: 'Breathable linen shirt for relaxed everyday comfort.',
    category: 'Casual Wear',
    audience: 'Everyday',
    basePrice: 2200,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Sky Blue', 'Beige'],
    stock: 100,
    isActive: true,
    isFeatured: false,
    badge: 'Essentials',
    palette: 'linear-gradient(135deg, #f5f5f5, #bdbdbd)',
  },
  {
    name: 'Festive Silk Kurta Set',
    description: 'A polished silk kurta set with festive detailing and all-day comfort.',
    category: 'Formal Wear',
    audience: 'Festive',
    basePrice: 6800,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Maroon', 'Ivory'],
    stock: 35,
    isActive: true,
    isFeatured: true,
    badge: 'Festive',
    palette: 'linear-gradient(135deg, #7f1d1d, #f5d0a9)',
  },
  {
    name: 'Tailored Tuxedo Edit',
    description: 'Made-to-measure evening tuxedo styling for receptions and black-tie events.',
    category: 'Tailored',
    audience: 'Party',
    basePrice: 18500,
    sizes: ['Made to Measure'],
    colors: ['Black', 'Ivory'],
    stock: null,
    isActive: true,
    isFeatured: true,
    badge: 'Custom',
    palette: 'linear-gradient(135deg, #111827, #9ca3af)',
  },
  {
    name: 'Everyday Co-ord Set',
    description: 'Relaxed matching separates with a clean silhouette for daily wear.',
    category: 'Casual Wear',
    audience: 'Everyday',
    basePrice: 3200,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Sage', 'Cream'],
    stock: 60,
    isActive: true,
    isFeatured: false,
    badge: 'Easy Wear',
    palette: 'linear-gradient(135deg, #8ea58c, #f7efe5)',
  },
  {
    name: 'Embroidered Reception Lehenga',
    description: 'Detailed lehenga with contemporary sparkle for wedding receptions.',
    category: 'Wedding Wear',
    audience: 'Wedding',
    basePrice: 24500,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Rose Gold', 'Champagne'],
    stock: 12,
    isActive: true,
    isFeatured: true,
    badge: 'Signature',
    palette: 'linear-gradient(135deg, #b76e79, #f8e4c9)',
  },
];

const tiers = [
  {
    name: 'Silver',
    description: 'Entry VIP access with shopping discounts and early previews.',
    monthlyPrice: 299,
    annualPrice: 2499,
    discountPercentage: 5,
    customOrderDiscount: 3,
    features: ['5% Storewide Discount', 'Early Access to Drops', 'Standard Custom Support'],
    isActive: true,
    position: 1,
    earlyAccess: true,
  },
  {
    name: 'Gold',
    description: 'Premium rewards with higher discounts and faster tailoring.',
    monthlyPrice: 599,
    annualPrice: 4999,
    discountPercentage: 10,
    customOrderDiscount: 8,
    features: ['10% Storewide Discount', '48h Early Access', 'Priority Custom Stitching', 'Free Shipping'],
    isActive: true,
    position: 2,
    earlyAccess: true,
    prioritySupport: true,
    freeShipping: true,
  },
  {
    name: 'Platinum',
    description: 'Elite fashion status with maximum benefits and personal styling.',
    monthlyPrice: 999,
    annualPrice: 8999,
    discountPercentage: 15,
    customOrderDiscount: 12,
    features: ['15% Storewide Discount', 'Exclusive Collection Access', 'Fastest Delivery Route', 'Personal Stylist Consult'],
    isActive: true,
    position: 3,
    earlyAccess: true,
    prioritySupport: true,
    freeShipping: true,
    maxCustomOrders: 5,
  },
];

const getMongoUri = () => {
  return process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
};

const seedCollection = async (model, items, key) => {
  let created = 0;

  for (const item of items) {
    const result = await model.updateOne(
      { [key]: item[key] },
      { $setOnInsert: item },
      { upsert: true }
    );

    if (result.upsertedCount) {
      created += result.upsertedCount;
    }
  }

  return created;
};

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD === 'changeme') {
    return false;
  }

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    return false;
  }

  await User.create({
    firstName: 'Store',
    lastName: 'Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    isActive: true,
  });

  return true;
};

const seedDB = async () => {
  try {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
      throw new Error('No MongoDB URI configured. Set MONGODB_ATLAS_URI before seeding.');
    }

    console.log(`Connecting to MongoDB at ${mongoUri.split('@').pop()}...`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB for seeding.');

    const summary = await seedDefaultData();

    console.log(`Seed complete. Created ${summary.createdProducts} products, ${summary.createdTiers} membership tiers, admin created: ${summary.createdAdmin}.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

const seedDefaultData = async () => {
  const createdProducts = await seedCollection(Product, products, 'name');
  const createdTiers = await seedCollection(MembershipTier, tiers, 'name');
  const createdAdmin = await seedAdmin();

  return {
    createdProducts,
    createdTiers,
    createdAdmin,
  };
};

if (require.main === module) {
  seedDB();
}

module.exports = {
  seedDB,
  seedDefaultData,
};
