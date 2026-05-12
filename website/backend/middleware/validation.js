const { validationResult, body, param, query } = require('express-validator');
const { AppError } = require('./errorHandler');

const isValidEntityId = (value) => {
  const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
  return mongoIdPattern.test(value) || /^demo_/.test(value);
};

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new AppError(errorMessages, 400);
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Product validation rules
const validateProductCreate = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('sizes').isArray({ min: 1 }).withMessage('At least one size is required'),
];

// Order validation rules
const validateOrderCreate = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
];

// Custom order validation rules
const validateCustomOrderCreate = [
  body('title').trim().notEmpty().withMessage('Custom order title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('desiredDate').isISO8601().withMessage('Valid desired date is required'),
  body('estimatedBudget').isFloat({ min: 0 }).withMessage('Estimated budget must be positive'),
];

// ID validation
const validateId = [
  param('id')
    .custom((value) => {
      if (!isValidEntityId(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    })
    .withMessage('Invalid ID format'),
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProductCreate,
  validateOrderCreate,
  validateCustomOrderCreate,
  validateId,
  validatePagination,
};
