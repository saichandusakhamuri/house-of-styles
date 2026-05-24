const express = require('express');
const { AppError } = require('../middleware/errorHandler');
const { getStaticProductById, getStaticProducts } = require('../data/staticProducts');

const router = express.Router();

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

router.get('/', (req, res) => {
  const { category, audience, search, isFeatured } = req.query;
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);
  const skip = (page - 1) * limit;
  const filteredProducts = getStaticProducts({ category, audience, search, isFeatured });

  res.json({
    success: true,
    source: 'static',
    data: filteredProducts.slice(skip, skip + limit),
    pagination: {
      total: filteredProducts.length,
      page,
      limit,
      pages: Math.ceil(filteredProducts.length / limit),
    },
  });
});

router.get('/:id', (req, res) => {
  const product = getStaticProductById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json({
    success: true,
    source: 'static',
    data: product,
  });
});

router.all('/', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Product management is disabled in the Tomcat/static catalog build.',
  });
});

router.all('/:id', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Product updates are disabled in the Tomcat/static catalog build.',
  });
});

module.exports = router;
