# House of Styles Backend API

A comprehensive RESTful API backend for the House of Styles e-commerce platform, built with Node.js and Express. MongoDB support is optional; the backend can run in demo mode without an external database.

## Features

- **User Management**: Registration, authentication, profile management with JWT
- **Products**: Full product catalog with images, ratings, and reviews
- **Membership Tiers**: Silver, Gold, Diamond with tiered pricing and discounts
- **Dynamic Pricing**: Automatic price calculation based on user membership
- **Orders**: Complete order management with status tracking
- **Custom Orders**: Bespoke design requests with quote system
- **Real-time Updates**: Socket.IO integration for order status notifications
- **Security**: Input validation, password hashing, role-based access control

## Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: Optional MongoDB (demo mode available without external DB)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Security**: Helmet, bcryptjs, express-validator
- **Payments**: Stripe integration (ready for implementation)

## Installation

### Prerequisites

- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup

1. **Clone and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   - Set `MONGODB_URI` for local MongoDB or `MONGODB_ATLAS_URI` for MongoDB Atlas
   - Set `JWT_SECRET` to a secure random string
   - Configure Stripe keys if using payments
   - Set `PORT` (default: 5000)

5. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

The server will be available at `http://localhost:5001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with pagination, filtering, search)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)
- `POST /api/orders/:id/cancel` - Cancel order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/membership` - Get membership info
- `POST /api/users/add-shipping-address` - Add shipping address
- `PUT /api/users/shipping-address/:addressId` - Update shipping address
- `DELETE /api/users/shipping-address/:addressId` - Delete shipping address
- `GET /api/users` - Get all users (Admin)

### Membership
- `GET /api/memberships` - Get all membership tiers
- `GET /api/memberships/:id` - Get tier details
- `POST /api/memberships/upgrade` - Upgrade membership
- `POST /api/memberships/cancel` - Cancel membership
- `POST /api/memberships` - Create tier (Admin)
- `PUT /api/memberships/:id` - Update tier (Admin)

## Database Models

### User
- Basic info (name, email, phone)
- Membership tier with expiry date
- Shipping addresses
- Preferences (notifications, promotions)
- Statistics (total orders, total spent)

### Product
- Category and audience targeting
- Base price with automatic membership discounts
- Images, sizes, colors, materials
- Ratings and reviews
- Stock tracking

### MembershipTier
- Discount percentages
- Annual/monthly pricing
- Features list
- Custom order discounts
- Priority support flag

### Order
- Items with sizes, colors, quantities
- Pricing breakdown (subtotal, discount, tax, shipping)
- Shipping and billing addresses
- Payment and order status tracking

### CustomOrder
- Design details and reference images
- Quoted price and timeline
- Designer assignment
- Communication history
- Feedback and ratings

### Style
- Collection of products
- Privacy settings (public/private)
- Likes, saves, comments
- Featured styling

## Pricing Logic

The pricing service (`services/pricing.js`) handles:

1. **Product Pricing**: Apply membership discounts automatically
2. **Order Totals**: Calculate with tax, shipping, and membership discounts
3. **Custom Orders**: Complex pricing with advance payment system
4. **Coupons**: Validate and apply promotional codes

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack trace (development only)"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Real-time Features

Socket.IO is configured for real-time notifications:

- Order status updates
- Membership tier changes
- Message notifications

Clients can listen for events like:
```javascript
socket.on('orderStatusUpdated', (data) => {
  console.log('Order status:', data.status);
});
```

## Next Steps

- [ ] Payment integration (Stripe webhook handlers)
- [ ] Custom order routes (create, update, quote)
- [ ] Admin dashboard endpoints
- [ ] Email notifications service
- [ ] Search and filtering optimization
- [ ] Analytics and reporting
- [ ] File upload service (images)
- [ ] Unit and integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting and security hardening

## Support

For issues or questions, create an issue in the repository or contact the development team.
