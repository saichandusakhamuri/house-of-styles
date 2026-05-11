require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const MembershipTier = require('./models/MembershipTier');

const products = [
  {
    name: "Classic Navy Blazer",
    description: "Tailored fit navy blue blazer for professional settings.",
    basePrice: 4500,
    finalPrice: 4500,
    category: "Formal Wear",
    audience: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy Blue"],
    stockQuantity: 50,
    isActive: true,
    isFeatured: true,
    badge: "Bestseller",
    palette: "linear-gradient(135deg, #2c3e50, #000000)"
  },
  {
    name: "Regal Wedding Sherwani",
    description: "Gold embroidered sherwani for premium wedding styling.",
    basePrice: 12500,
    finalPrice: 12500,
    category: "Wedding Wear",
    audience: "Wedding",
    sizes: ["M", "L", "XL"],
    colors: ["Gold", "Cream"],
    stockQuantity: 20,
    isActive: true,
    isFeatured: true,
    badge: "Premium",
    palette: "linear-gradient(135deg, #d4af37, #8b4513)"
  },
  {
    name: "Elegant Evening Gown",
    description: "Flowing silk dress designed for evening movement.",
    basePrice: 8900,
    finalPrice: 8900,
    category: "Party Wear",
    audience: "Women",
    sizes: ["XS", "S", "M"],
    colors: ["Emerald Green", "Midnight Black"],
    stockQuantity: 15,
    isActive: true,
    isFeatured: true,
    badge: "New",
    palette: "linear-gradient(135deg, #004d40, #000000)"
  },
  {
    name: "Casual Linen Shirt",
    description: "Breathable linen shirt for relaxed everyday comfort.",
    basePrice: 2200,
    finalPrice: 2200,
    category: "Casual Wear",
    audience: "Everyday",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Sky Blue", "Beige"],
    stockQuantity: 100,
    isActive: true,
    isFeatured: false,
    badge: "Essentials",
    palette: "linear-gradient(135deg, #f5f5f5, #bdbdbd)"
  }
];

const tiers = [
  {
    name: "Silver",
    description: "Entry VIP access with shopping discounts and early previews.",
    monthlyPrice: 299,
    annualPrice: 2499,
    discountPercentage: 5,
    features: ["5% Storewide Discount", "Early Access to Drops", "Standard Custom Support"],
    isActive: true
  },
  {
    name: "Gold",
    description: "Premium rewards with higher discounts and faster tailoring.",
    monthlyPrice: 599,
    annualPrice: 4999,
    discountPercentage: 10,
    features: ["10% Storewide Discount", "48h Early Access", "Priority Custom Stitching", "Free Shipping"],
    isActive: true
  },
  {
    name: "Platinum",
    description: "Elite fashion status with maximum benefits and personal styling.",
    monthlyPrice: 999,
    annualPrice: 8999,
    discountPercentage: 15,
    features: ["15% Storewide Discount", "Exclusive Collection Access", "Fastest Delivery Route", "Personal Stylist Consult"],
    isActive: true
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/house-of-styles';
    console.log(`Connecting to MongoDB at ${mongoURI.split('@').pop()}...`);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB for seeding...");

    // Clear existing
    await Product.deleteMany({});
    await MembershipTier.deleteMany({});

    // Add new
    await Product.insertMany(products);
    await MembershipTier.insertMany(tiers);

    console.log("✅ Database seeded successfully with 4 products and 3 membership tiers!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
