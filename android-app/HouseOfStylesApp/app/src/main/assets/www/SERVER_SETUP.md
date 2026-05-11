# 🏠 House of Styles - Backend Server Connection

Your frontend and backend are now **fully connected**! Here's everything you need to know.

## 📋 Quick Overview

```
Frontend (Website)  ───→  Backend Server  ───→  MongoDB
   ↓
Real-time Updates (Socket.IO)
```

## 🚀 How to Connect Everything

### Step 1: Configure Backend (One-time)

```bash
cd backend
cp .env.example .env
```

Edit `.env` and make sure:
```env
MONGODB_URI=mongodb://localhost:27017/house-of-styles
PORT=5001
```

### Step 2: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Connected to MongoDB at localhost:27017/house-of-styles
🚀 Server running on port 5001
```

### Step 3: Open Frontend

Keep the backend running, then in another terminal:

```bash
# Option A: Use Python
python -m http.server 8000

# Option B: Use Node
npx http-server

# Option C: Open directly in browser
open index.html
```

Navigate to:
- **Main Website**: http://localhost:8000 (or file:///path/to/index.html)
- **VIP Club**: http://localhost:8000/vip.html
- **Custom Studio**: http://localhost:8000/custom.html

### Step 4: Test the Connection

**Quick Browser Test:**
1. Open index.html
2. Press `F12` to open Developer Tools
3. Go to Console tab
4. Copy and paste the contents of `browser-test.js`
5. Press Enter

**Or in Terminal:**
```bash
node test-connection.js
```

## ✅ What's Connected

| Component | Status | Purpose |
|-----------|--------|---------|
| **Products** | ✅ Connected | Load items from backend database |
| **Cart** | ✅ Connected | Store and manage orders |
| **Authentication** | ✅ Connected | Register/login with JWT tokens |
| **Memberships** | ✅ Connected | Manage tier upgrades |
| **Custom Orders** | ✅ Connected | Create and track inquiries |
| **Real-time Updates** | ✅ Connected | Socket.IO notifications |
| **Payments** | 🔲 Ready | Stripe integration ready (not yet implemented) |

## 🧪 Test User Flows

### Test 1: Register & Browse
1. Click "Login / Sign Up"
2. Sign up with:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `SecurePass123!` (must have uppercase, number, special char)
3. Should see products loading

### Test 2: Upgrade Membership
1. Go to "VIP Club" (top navigation)
2. Select a tier (Silver/Gold/Diamond)
3. Choose monthly/annual billing
4. Click "Upgrade"
5. Return to main page - products should show discounts!

### Test 3: Add to Cart & Checkout
1. Browse products
2. Add items to cart
3. View cart
4. Click "Checkout"
5. Order should be created in backend

### Test 4: Custom Order
1. Go to "Custom Studio"
2. Fill in design details:
   - Title: "My Design"
   - Description: "Details here"
   - Desired Date: Pick a future date
   - Budget: Enter amount
3. Submit - order created!

## 🔗 Connection Details

### Frontend → Backend
- **API Base URL**: `http://localhost:5001/api`
- **Health Check**: `http://localhost:5001/api/health`
- **Authentication**: JWT tokens in Authorization header
- **Real-time**: Socket.IO on `ws://localhost:5001`

### Backend Configuration
- **Node.js**: Express.js server
- **Port**: 5000 (configurable in .env)
- **Database**: MongoDB at localhost:27017
- **CORS**: Enabled for http://localhost:3000

### Frontend Features
- **API Client**: `api-client.js` (handles all requests)
- **Notifications**: `notifications.js` (Socket.IO events)
- **Main Site**: `integration.js` (products, cart, auth)
- **VIP Page**: `vip-integration.js` (memberships)
- **Custom Orders**: `custom-integration.js` (inquiries)

## 📁 File Structure

```
/Users/ss/Documents/New project/
├── index.html                 ← Main website
├── vip.html                   ← VIP Club
├── custom.html                ← Custom Studio
├── api-client.js              ← All API calls
├── notifications.js           ← Real-time system
├── integration.js             ← Main site logic
├── vip-integration.js         ← VIP logic
├── custom-integration.js      ← Custom order logic
├── browser-test.js            ← Connection tester
├── test-connection.js         ← Node.js tester
├── QUICK_START.md             ← Setup guide
├── INTEGRATION_GUIDE.md       ← Full integration docs
├── start.sh                   ← Auto-start script (macOS/Linux)
├── start.bat                  ← Auto-start script (Windows)
└── backend/                   ← Express.js API
    ├── .env                   ← Configuration
    ├── server.js              ← Entry point
    ├── config/                ← Database & logging
    ├── models/                ← Data schemas
    ├── routes/                ← API endpoints
    ├── middleware/            ← Auth, validation, errors
    ├── services/              ← Business logic
    └── package.json           ← Dependencies
```

## 🐛 Troubleshooting

### ❌ Cannot connect to backend
```bash
# Check if backend is running
curl http://localhost:5001/api/health

# If not, start it:
cd backend && npm run dev
```

### ❌ MongoDB connection error
```bash
# Start MongoDB
mongod

# Or on macOS with Homebrew:
brew services start mongodb-community
```

### ❌ CORS error in browser console
- Check backend `.env` has correct CORS_ORIGIN
- Make sure backend is running
- Verify no port conflicts

### ❌ "Products not loading"
- Check backend is running
- Add products to database (or run seed script)
- Check browser console for API errors

### ❌ "Real-time notifications not working"
- Ensure backend is running
- Check Socket.IO library is loaded
- Look for connection errors in browser console

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (HTML)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ index.html / vip.html / custom.html          │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐│  │
│  │  │ integration.js / vip-integration.js     ││  │
│  │  │ custom-integration.js (Business Logic)  ││  │
│  │  └─────────────────────────────────────────┘│  │
│  │           ↓              ↓                    │  │
│  │  ┌─────────────────┐  ┌─────────────────┐   │  │
│  │  │  api-client.js  │  │notifications.js │   │  │
│  │  │  (REST API)     │  │(Real-time)      │   │  │
│  │  └─────────────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
└───────┬──────────────────────────────┬──────────────┘
        │ HTTP/HTTPS                   │ WebSocket
        │ (API calls)                  │ (Socket.IO)
        ↓                              ↓
┌─────────────────────────────────────────────────────┐
│           Backend (Express.js)                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ http://localhost:5001                        │  │
│  │                                               │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │ Routes: /auth /products /orders /...   │ │  │
│  │  │ Middleware: auth, validation, errors   │ │  │
│  │  │ Services: pricing, logging             │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  │              ↓                              │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │ MongoDB                                 │ │  │
│  │  │ Users, Products, Orders, CustomOrders  │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 🎯 Next Steps

1. **✅ Server Running** - Backend server is running
2. **✅ Frontend Connected** - Frontend can reach backend
3. **🔲 Test User Flows** - Try registering, shopping, upgrading
4. **🔲 Add Sample Data** - Populate products for testing
5. **🔲 Payment Integration** - Implement Stripe (optional)
6. **🔲 Deploy** - Put live on production server

## 📞 API Endpoint Reference

See `backend/README.md` for full API documentation.

Quick reference:
- `POST /auth/register` - Create account
- `POST /auth/login` - Login user
- `GET /products` - List products
- `POST /orders` - Create order
- `POST /custom-orders` - Create inquiry
- `GET /memberships` - List tiers
- `POST /memberships/upgrade` - Upgrade tier

## 🎉 You're All Set!

Your House of Styles app is ready to go!

Start the backend:
```bash
cd backend && npm run dev
```

Then open the frontend files in your browser and start testing! 

---

**Questions?** Check:
- `QUICK_START.md` - Step-by-step setup
- `INTEGRATION_GUIDE.md` - Full integration details
- `backend/README.md` - Backend API docs
