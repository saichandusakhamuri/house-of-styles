const express = require('express');
const { staticProducts } = require('../data/staticProducts');
const { staticMembershipTiers } = require('../data/staticMembershipTiers');

const router = express.Router();

const activeProducts = staticProducts.filter((product) => product.isActive);
const featuredProducts = activeProducts.filter((product) => product.isFeatured);
const categories = [...new Set(activeProducts.map((product) => product.category))];

const priceValues = activeProducts.map((product) => Number(product.finalPrice || product.basePrice || 0));
const lowestPrice = priceValues.length ? Math.min(...priceValues) : 0;
const highestPrice = priceValues.length ? Math.max(...priceValues) : 0;

const heroProducts = featuredProducts.slice(0, 2);

const content = {
  homepage: {
    eyebrow: 'New Generation Fashion Store',
    title: 'House of Styles is where live fashion meets live service.',
    summary:
      'A shopping-first homepage powered by the current catalog, membership tiers, custom ordering, and real-time account flows.',
    actions: [
      { label: 'Shop Now', href: '#shop', variant: 'primary' },
      { label: 'Explore Custom Studio', href: 'custom.html', variant: 'secondary' },
    ],
    stats: [
      {
        label: `${activeProducts.length} Live Pieces`,
        detail: `${categories.length} categories refreshed from the backend`,
      },
      {
        label: `${heroProducts.length} Featured Picks`,
        detail: heroProducts.length
          ? 'Top styles loaded from the current catalog'
          : 'Featured styles will appear as soon as the catalog loads',
      },
      {
        label: lowestPrice ? `From Rs ${lowestPrice}` : 'Live Pricing',
        detail: highestPrice ? `Up to Rs ${highestPrice} across the catalog` : 'Pricing comes from the live backend',
      },
    ],
    heroCards: heroProducts.length
      ? heroProducts.map((product) => ({
          tag: product.category,
          title: `${product.name} at Rs ${product.finalPrice || product.basePrice}`,
          detail: `${product.audience} • ${product.badge || 'Featured style'}`,
        }))
      : [
          {
            tag: 'Live Catalog',
            title: 'Featured styles load from the backend',
            detail: 'The site updates as the catalog changes',
          },
          {
            tag: 'Trending',
            title: 'More live styles load automatically',
            detail: 'Pricing and availability are not hardcoded',
          },
        ],
    pills: [
      `${activeProducts.length} live styles`,
      `${categories.length} style families`,
      `${featuredProducts.length} featured picks`,
      lowestPrice ? `From Rs ${lowestPrice}` : 'Backend pricing',
      'Live shopping experience',
    ],
    panels: [
      {
        eyebrow: 'Formal Wear',
        title: 'Professional polish built around current product data.',
      },
      {
        eyebrow: 'Wedding Wear',
        title: 'Premium ceremonial looks pulled from the live catalog.',
      },
      {
        eyebrow: 'Party Wear',
        title: 'Statement pieces that refresh as the catalog changes.',
      },
      {
        eyebrow: 'Casual Wear',
        title: 'Refined comfort with backend-fed availability.',
      },
    ],
    features: [
      {
        title: 'VIP Access',
        text: 'Membership pricing and perks are pulled from live tier data.',
      },
      {
        title: 'Custom Studio',
        text: 'Custom orders and follow-up flows are backed by the API.',
      },
    ],
    heroSubtext:
      'A shopping-first homepage with curated collections, VIP rewards, and a custom style studio built into one brand experience.',
  },
  vip: {
    eyebrow: 'VIP Club',
    title: 'Exclusive Fashion Benefits',
    summary:
      'Join the House of Styles VIP Club to unlock specialized pricing, priority tailoring, and early access to our most anticipated collections.',
    cardTitle: 'Elevate Your Experience',
    cardText:
      'Higher tiers unlock faster tailoring priority, deeper discounts, and exclusive stylist consultations.',
    statusTitle: 'Track Your Rewards',
    statusEyebrow: 'Membership Status',
    benefits: [
      'Membership-based discounts linked to signed-in customer status',
      'Priority access to new collections and selected launches',
      'Better custom-stitching support and faster service routes',
      'Premium styling perks across major shopping occasions',
    ],
    signedOutTitle: 'Customer sign-in required',
    signedOutText:
      'Please create your account or log in from the main store to view your personal VIP discounts.',
    tiersTitle: 'Choose the best VIP tier',
  },
  custom: {
    eyebrow: 'Custom Studio',
    title: 'Tailored to your brief, not just your budget.',
    summary:
      'The studio pulls from live catalog and order data so we can shape a sharper tailoring plan around the garment, occasion, fit, and budget you choose.',
    cardTitle: 'Bespoke Artistry',
    cardText:
      'Experience the luxury of garments crafted specifically for your silhouette and occasion.',
    sectionEyebrow: 'Select Options',
    sectionNote:
      'Choose the foundation of your custom piece. Each selection helps the studio understand the kind of outfit you want to create.',
    processSteps: [
      {
        title: 'Pick your options',
        text: 'Choose the garment, occasion, fit, and budget that match your needs.',
      },
      {
        title: 'Studio review',
        text: 'The live order flow uses your selected options to shape the tailoring brief.',
      },
      {
        title: 'Refine and stitch',
        text: 'Once your picks are saved, the next steps can be tracked from your account.',
      },
    ],
  },
  catalog: {
    categories,
    featured: heroProducts.map((product) => ({
      name: product.name,
      category: product.category,
      audience: product.audience,
      price: product.finalPrice || product.basePrice,
      badge: product.badge || 'Featured',
      description: product.description,
      images: product.images || [],
      palette: product.palette,
    })),
  },
  membership: staticMembershipTiers.map((tier) => ({
    name: tier.name,
    description: tier.description,
    monthlyPrice: tier.monthlyPrice,
    annualPrice: tier.annualPrice,
    discountPercentage: tier.discountPercentage,
    features: tier.features,
  })),
};

router.get('/', (req, res) => {
  res.json({
    success: true,
    source: 'static',
    data: content,
  });
});

module.exports = router;
