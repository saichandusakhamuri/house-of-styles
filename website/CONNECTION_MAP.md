# 🔗 Connection Map - How Everything Works Together

## System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    FRONTEND (Web)                     ┃
┃  ┌──────────────────────────────────────────────┐   ┃
┃  │ index.html / vip.html / custom.html          │   ┃
┃  │                                               │   ┃
┃  │ Scripts loaded:                              │   ┃
┃  │ 1. api-client.js ────→ REST API calls        │   ┃
┃  │ 2. notifications.js ─→ Real-time updates     │   ┃
┃  │ 3. integration.js ───→ App logic             │   ┃
┃  │ 4. vip-integration.js                        │   ┃
┃  │ 5. custom-integration.js                     │   ┃
┃  │ 6. Socket.IO (CDN) ──→ WebSocket             │   ┃
┃  └──────────────────────────────────────────────┘   ┃
┗━━━━━━━━━━━━┬────────────────────────────────┬────────┛
             │ HTTP                           │ WebSocket
             ↓                                ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              BACKEND (Node.js/Express)               ┃
┃  ┌──────────────────────────────────────────────┐   ┃
┃  │ http://localhost:5001                        │   ┃
┃  │                                               │   ┃
┃  │ Routes:                                      │   ┃
┃  │ • /api/auth ─────────→ Login/Register       │   ┃
┃  │ • /api/products ──────→ Product catalog     │   ┃
┃  │ • /api/orders ────────→ Order management    │   ┃
┃  │ • /api/custom-orders ─→ Design requests    │   ┃
┃  │ • /api/memberships ───→ Tier management    │   ┃
┃  │ • /api/users ─────────→ User profiles      │   ┃
┃  │ • /api/styles ────────→ Collections        │   ┃
┃  │                                               │   ┃
┃  │ Middleware:                                  │   ┃
┃  │ • JWT authentication                         │   ┃
┃  │ • Input validation                           │   ┃
┃  │ • Error handling                             │   ┃
┃  │ • CORS configuration                         │   ┃
┃  │ • Rate limiting                              │   ┃
┃  │                                               │   ┃
┃  │ Services:                                    │   ┃
┃  │ • Pricing service (membership discounts)     │   ┃
┃  │ • Logger service (Winston)                   │   ┃
┃  │ • Email service (ready for integration)      │   ┃
┃  │                                               │   ┃
┃  │ Socket.IO:                                   │   ┃
┃  │ • Order updates → User notifications        │   ┃
┃  │ • Quote notifications → Custom order alerts  │   ┃
┃  └──────────────────────────────────────────────┘   ┃
┗━━━━━━━━━━━━┬────────────────────────────────────┬───┛
             │                                    │
             ↓                                    ↓
┏━━━━━━━━━━━━━━━━━━━━━┓              ┏━━━━━━━━━━━━━━━━━━┓
┃   MongoDB Database   ┃              ┃  Cache/Session   ┃
┃                      ┃              ┃  (localStorage)  ┃
┃ Collections:         ┃              ┃                  ┃
┃ • users             ┃              ┃ Stores:          ┃
┃ • products          ┃              ┃ • JWT token      ┃
┃ • orders            ┃              ┃ • User profile   ┃
┃ • custom_orders     ┃              ┃ • Cart items     ┃
┃ • membership_tiers  ┃              ┃ • Favorites      ┃
┃ • styles            ┃              ┃                  ┃
┃ • reviews           ┃              ┗━━━━━━━━━━━━━━━━━━┛
┗━━━━━━━━━━━━━━━━━━━━━┛
```

## Data Flow Examples

### Example 1: User Registration & Login

```
Frontend (index.html)
        ↓
User fills signup form
        ↓
api-client.js calls register()
        ↓
HTTP POST → http://localhost:5001/api/auth/register
        ↓
Backend routes/auth.js
        ↓
Validate input (middleware/validation.js)
        ↓
Hash password (bcryptjs)
        ↓
Create user in MongoDB
        ↓
Generate JWT token
        ↓
HTTP 200 → {token, user}
        ↓
Frontend stores token in localStorage
        ↓
User logged in ✅
```

### Example 2: Browse Products with Membership Discount

```
Frontend (index.html)
        ↓
integration.js calls loadProducts()
        ↓
api-client.js calls getProducts({category: 'Wedding'})
        ↓
HTTP GET → http://localhost:5001/api/products?category=Wedding
        ↓
Backend routes/products.js
        ↓
Fetch products from MongoDB
        ↓
For each product:
  • Get user's membership tier
  • Call pricing.js calculateProductPrice()
  • Return both basePrice and finalPrice
        ↓
HTTP 200 → [{id, name, basePrice, finalPrice, discountPercentage, ...}]
        ↓
Frontend displays:
  • Product image
  • Original price (strikethrough)
  • Final price (in green)
  • Discount badge "Save 10%!"
        ↓
User sees discounted prices ✅
```

### Example 3: Create Custom Order & Receive Quote

```
Frontend (custom.html)
        ↓
User fills custom order form
        ↓
custom-integration.js calls api.createCustomOrder()
        ↓
HTTP POST → http://localhost:5001/api/custom-orders
        ↓
Backend creates customOrder document in MongoDB
        ↓
Socket.IO stores io instance
        ↓
HTTP 201 → {customOrderId, status: 'inquiry'}
        ↓
Frontend shows "Order submitted!" message
        ↓
────────────────────────────────────────
[Later: Admin sends quote]
────────────────────────────────────────
        ↓
Backend admin calls POST /api/custom-orders/{id}/quote
        ↓
Calculate quote price using pricing.js
        ↓
Update customOrder.quotedPrice, quotedDate
        ↓
io.to('user_' + userId).emit('customOrderQuoted', {...})
        ↓
Frontend notifications.js receives event
        ↓
showNotification('Quote received!')
        ↓
Browser shows notification badge
        ↓
Integration re-renders custom order card
        ↓
User sees quote with Accept/Reject buttons ✅
```

### Example 4: Checkout & Create Order

```
Frontend (index.html)
        ↓
User clicks "Checkout"
        ↓
integration.js calls api.createOrder({
  items: cart,
  shippingAddress: {...},
  membershipTierId: (if member)
})
        ↓
HTTP POST → http://localhost:5001/api/orders
        ↓
Backend validates all items exist in MongoDB
        ↓
For each item in cart:
  • Get product details
  • Get customer's membership
  • Calculate price with discount
  • Get quantity × discounted price
        ↓
Calculate totals:
  • Subtotal = sum of item prices
  • Discount = membership discount amount
  • Tax = subtotal × 5%
  • Shipping = $10 (free if premium member)
  • Total = subtotal - discount + tax + shipping
        ↓
Create Order document in MongoDB
        ↓
Generate orderNumber (ORD-timestamp-random)
        ↓
io.emit('orderCreated', {orderId, status: 'pending'})
        ↓
HTTP 201 → {orderId, total, orderNumber}
        ↓
Frontend clears cart from localStorage
        ↓
integration.js shows "Order confirmed!" message
        ↓
Displays order number and total
        ↓
User receives email (when configured) ✅
```

### Example 5: Admin Updates Order Status

```
Backend Admin Panel (or API call)
        ↓
Admin clicks "Mark as Shipped"
        ↓
HTTP PUT → /api/orders/{orderId}
  {status: 'shipped', trackingNumber: 'ABC123'}
        ↓
Backend validates JWT (must be admin)
        ↓
Update order in MongoDB
        ↓
io.to('user_' + userId).emit('orderStatusUpdated', {
  orderId,
  status: 'shipped',
  trackingNumber: 'ABC123'
})
        ↓
Frontend notifications.js receives event
        ↓
notifications.showNotification('Your order shipped!')
        ↓
Browser notification appears
        ↓
integration.js updates order list UI
        ↓
Customer sees tracking number ✅
```

## Connection Points

### HTTP Endpoints (REST API)

All calls include:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Responses use format:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {...},
  "pagination": {page, limit, total}
}
```

### WebSocket Events (Socket.IO)

**Server → Client:**
- `orderStatusUpdated` - Order status changed
- `customOrderQuoted` - Quote received for custom order
- `connect` - Connected to server
- `disconnect` - Disconnected from server
- `error` - Connection error

**Client → Server:**
- (Connection uses JWT authentication in handshake)

### Local Storage (Browser)

Keys stored by frontend:
```
houseOfTailor-token    ← JWT for API calls
houseOfTailor-user     ← {id, email, name, ...}
houseOfTailor-cart     ← [{productId, quantity, ...}]
houseOfTailor-favorites ← [productId, ...]
```

## Environment Configuration

### Frontend
No config needed - api-client.js defaults to:
```
http://localhost:5001/api
ws://localhost:5001
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/house-of-styles
PORT=5001
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

### Database
MongoDB runs on: `mongodb://localhost:27017`
Default database: `house-of-styles`

## Security Implementation

### Authentication Flow
1. User registers → Password hashed with bcryptjs
2. User logs in → Compare hashed passwords
3. Backend generates JWT token (7 day expiry)
4. Frontend stores token in localStorage
5. API client adds Authorization header on all requests:
   ```
   Authorization: Bearer eyJhbGc...
   ```
6. Backend verifies token in middleware/auth.js

### Authorization Levels
- **Anonymous**: Can view public products
- **User**: Can browse, cart, order, custom orders
- **Admin**: Can view all orders, update orders, manage products

### Security Measures
- JWT validation on all protected routes
- CORS configured to allow only specified origins
- Helmet.js for security headers
- Input validation on all endpoints
- Password hashing with bcryptjs (10 salt rounds)
- Rate limiting configured (5000ms window)

## Real-time Communication

### Socket.IO Connection Flow
1. Frontend user logs in
2. notifications.js connects to `http://localhost:5001`
3. Sends JWT token in connection handshake
4. Backend authenticates connection
5. Socket ID generated and stored
6. Server can now emit events to specific user:
   ```
   io.to(`user_${userId}`).emit('orderStatusUpdated', {...})
   ```
7. Frontend listener receives event
8. UI updates in real-time without page refresh

## Testing the Connection

### Browser Console Test
```javascript
// Paste this in browser DevTools Console
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(d => console.log('Connected!', d))
  .catch(e => console.error('Error:', e.message))
```

### Terminal Test
```bash
# Check backend health
curl http://localhost:5001/api/health

# Should return:
# {"status":"OK","timestamp":"2026-05-09T..."}
```

## Monitoring & Debugging

### Backend Logs
Logs stored in `backend/logs/`:
- `error.log` - Errors only
- `combined.log` - All requests
- Daily rotation enabled

View logs:
```bash
tail -f backend/logs/combined.log
```

### Browser DevTools
Open `F12` in browser and check:
- **Network** tab: See all API calls
- **Console** tab: See errors and socket events
- **Storage** tab: View localStorage (tokens, cart)

## Performance Notes

- Products cached on frontend (loaded once on page load)
- Cart persisted locally (only syncs on checkout)
- Membership pricing calculated server-side (most efficient)
- Socket.IO enables real-time without polling (saves bandwidth)
- Compression enabled on all API responses

---

**Everything is connected and ready to test!**

Start the backend and open the frontend files to begin.
