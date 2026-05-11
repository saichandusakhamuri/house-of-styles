# Frontend-Backend Integration Guide

## Overview

The House of Styles frontend has been fully integrated with the Express.js backend API. All three frontends (Website, Custom Studio, VIP Club) now communicate with the backend for real-time data and functionality.

## Files Added

### Core Integration Files

1. **api-client.js** - Universal API client for all endpoints
   - Authentication (login, signup, logout)
   - Product management
   - Orders and custom orders
   - User profiles and memberships
   - Styles and social features

2. **notifications.js** - Real-time notification system
   - Socket.IO integration
   - Order status updates
   - Custom order quotes
   - Browser notifications

3. **integration.js** - Main website integration
   - Product loading from backend
   - Shopping cart with backend sync
   - Authentication flow
   - Membership tier management
   - Real-time notifications

4. **vip-integration.js** - VIP Club integration
   - Display membership tiers from backend
   - Handle membership upgrades
   - Show user membership status
   - Membership pricing

5. **custom-integration.js** - Custom Studio integration
   - Create custom order inquiries
   - Track custom order status
   - Accept/reject quotes
   - View quote details
   - Communication history

## Setup Instructions

### 1. Backend Requirements

Ensure the backend is running:
```bash
cd backend
npm install
npm run dev
```

Backend API will be available at: `http://localhost:5001/api`

### 2. Frontend Configuration

Update API base URL if needed in the integration files:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

### 3. Include Scripts in HTML

The HTML files are already updated with:
```html
<!-- Backend Integration -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script src="api-client.js"></script>
<script src="notifications.js"></script>
<script src="integration.js"></script>
```

### 4. Android App Setup

Copy integration files to Android app:
```bash
node copy-to-android.js
```

Or manually copy these files to:
```
android-app/HouseOfStylesApp/app/src/main/assets/www/
```

## Features Integrated

### Website (index.html)
✅ Load products from backend API  
✅ Apply membership-based pricing  
✅ User registration and login  
✅ Shopping cart management  
✅ Order creation  
✅ Favorites sync  
✅ Real-time order notifications  

### VIP Club (vip.html)
✅ Display all membership tiers  
✅ Show current user membership  
✅ Handle tier upgrades  
✅ Show discount information  
✅ Pricing comparison  

### Custom Studio (custom.html)
✅ Create custom order inquiries  
✅ Track custom orders  
✅ Accept/reject quotes  
✅ View quote details  
✅ Communication history  
✅ Real-time quote notifications  

## User Authentication Flow

1. User clicks "Login / Sign Up"
2. Enters email, password, name (signup) or just email/password (login)
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. API client automatically includes token in all requests
6. User can now access protected features (cart, orders, custom orders, etc.)

## Product Pricing Logic

Products display different prices based on user membership:
- **No membership**: Base price
- **Silver member**: Base price - 5% discount
- **Gold member**: Base price - 10% discount
- **Diamond member**: Base price - 15% discount

Discounts are automatically calculated and displayed on product cards.

## Real-time Features

Socket.IO connects automatically when user logs in:
- **Order status updates**: User notified when order status changes
- **Custom order quotes**: Instant notification when designer sends quote
- **Typing indicators**: Real-time communication in custom order chats

## Storage

Local storage used for:
- JWT token
- User profile data
- Cart items (synced to backend on order)
- Favorites (synced with backend)

## Error Handling

All API requests include error handling:
- Failed requests show user-friendly messages
- Network errors gracefully handled
- Invalid tokens trigger re-authentication
- Form validation before submission

## Testing

### Test Registration
1. Click "Login / Sign Up"
2. Enter details: 
   - Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123!
3. Submit form
4. Should see success message and auto-login

### Test Product Purchase
1. Login with credentials
2. Browse products (should show membership pricing)
3. Add item to cart
4. Proceed to checkout
5. Order created and visible in backend database

### Test Custom Order
1. Login and go to Custom Studio
2. Fill order details
3. Submit inquiry
4. Track status as designer quotes
5. Accept/reject quote
6. View communication history

### Test VIP Upgrade
1. Login and go to VIP Club
2. Select membership tier
3. Choose monthly/annual billing
4. Complete upgrade
5. Refresh products page to see new pricing

## Troubleshooting

### API Connection Failed
- Check backend is running: `npm run dev` in backend folder
- Verify API base URL matches backend port (default: 5000)
- Check CORS configuration in backend

### Login Not Working
- Verify email exists in database
- Check password meets requirements (8+ chars, uppercase, number, special char)
- Check browser console for error messages

### Real-time Notifications Not Working
- Backend must be running with Socket.IO enabled
- Check browser console for socket connection errors
- Verify user is authenticated before connecting

### Products Not Loading
- Backend database must have products
- Check MongoDB connection in backend
- Verify products are marked as `isActive: true`

## Next Steps

1. **Payment Integration**: Implement Stripe payment processing
2. **Email Notifications**: Send order confirmations and updates via email
3. **Admin Dashboard**: Create admin panel for managing products and orders
4. **Analytics**: Track user behavior and sales metrics
5. **Mobile Optimization**: Fully responsive mobile experience
6. **Offline Support**: Enhanced service worker for offline shopping

## API Endpoint Reference

All endpoints are documented in [backend/README.md](../backend/README.md)

Key endpoints:
- `POST /auth/register` - New user registration
- `POST /auth/login` - User login
- `GET /products` - Fetch products (with pagination)
- `POST /orders` - Create order
- `POST /custom-orders` - Create custom order inquiry
- `GET /memberships` - Fetch membership tiers
- `POST /memberships/upgrade` - Upgrade membership

## Support

For integration issues or questions, refer to:
- Backend documentation: [backend/README.md](../backend/README.md)
- API client documentation in: [api-client.js](./api-client.js)
- Notification system documentation in: [notifications.js](./notifications.js)
