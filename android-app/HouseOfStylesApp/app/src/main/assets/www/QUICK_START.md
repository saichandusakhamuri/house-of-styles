# 🚀 Quick Setup - Connect Frontend to Backend

## Prerequisites

Make sure you have installed:
- **Node.js** v16+ (https://nodejs.org)
- **MongoDB** (local or cloud)

## Step 1: Configure Backend

### 1a. Copy Environment File

```bash
cd backend
cp .env.example .env
```

### 1b. Edit `.env` File

Open `backend/.env` and update:

```env
# MongoDB - Choose ONE:

# Option A: Local MongoDB (Default)
MONGODB_URI=mongodb://localhost:27017/house-of-styles

# Option B: MongoDB Atlas (Cloud) - Replace with your connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/house-of-styles?retryWrites=true&w=majority

# Keep other defaults:
NODE_ENV=development
PORT=5001
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Using Local MongoDB?** Start it first:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod
```

## Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 3: Start Backend Server

```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected to localhost:27017/house-of-styles
🚀 Server running on port 5001 in development mode
```

## Step 4: Test Backend Connection

In another terminal, from the project root:

```bash
# Run connection test
node test-connection.js
```

Expected results:
```
✅ Backend Server
✅ MongoDB Connection
✅ CORS Configuration
✅ Socket.IO
✅ Authentication Endpoints
```

## Step 5: Open Frontend

### Option A: Quick File Open
Simply open these files in your browser:
- `index.html` - Main website
- `vip.html` - VIP Club
- `custom.html` - Custom Studio

### Option B: Use Local Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server

# Or using PHP
php -S localhost:8000
```

Then open:
- http://localhost:8000
- http://localhost:8000/vip.html
- http://localhost:8000/custom.html

## Step 6: Test the Connection

### Register a New Account
1. Click "Login / Sign Up" button
2. Fill in the form:
   - **Name**: John Doe
   - **Email**: test@example.com
   - **Password**: SecurePass123! (must have: 8+ chars, uppercase, number, special char)
3. Click Register
4. Should see success message and auto-login

### Browse Products
1. After login, you should see products loading
2. Products should show:
   - Product image and name
   - Price (base price)
   - "Add to Cart" button
3. Add a product to cart

### Upgrade Membership
1. Click "VIP Club" in navigation
2. Select a membership tier (Silver/Gold/Diamond)
3. Choose billing period (Monthly or Annual)
4. "Upgrade" button should appear
5. After upgrade, go back to main site
6. Products should now show:
   - Original price (strikethrough)
   - New discounted price
   - "Member Discount" badge

### Try Custom Order
1. Click "Custom Studio" in navigation
2. Fill in custom order form:
   - Title: "My Custom Design"
   - Description: "I want a unique style"
   - Desired date: Select a future date
   - Budget: 500
3. Click "Submit Order"
4. Order should appear in list with "Inquiry" status

## Automated Startup

Want to start both server and see logs?

### macOS/Linux:
```bash
chmod +x start.sh
./start.sh
```

### Windows:
```cmd
start.bat
```

## Troubleshooting

### ❌ "Cannot reach backend server"
```bash
# Check if backend is running on port 5001
curl http://localhost:5001/api/health

# Should return: {"status":"OK","timestamp":"2026-05-09T..."}

# If not running, start it:
cd backend && npm run dev
```

### ❌ "MongoDB connection failed"
```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB:
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: Start MongoDB service in Services

# Check connection string in backend/.env
cat backend/.env | grep MONGODB_URI
```

### ❌ "CORS error in browser console"
- Make sure backend is running
- Check `CORS_ORIGIN` in `backend/.env` includes your frontend URL
- Default is: `http://localhost:3000` (update if using different port)

### ❌ "Registration password rejected"
Password must have:
- ✅ At least 8 characters
- ✅ At least one UPPERCASE letter
- ✅ At least one number
- ✅ At least one special character: !@#$%^&*

Example: `SecurePass123!`

### ❌ "Socket.IO not connecting"
- Ensure backend is running
- Check browser console for connection errors
- Verify `http://localhost:5001` is accessible

## Architecture Overview

```
Frontend (index.html, vip.html, custom.html)
    ↓
    ├─→ api-client.js (REST API calls)
    │    └─→ Backend API (http://localhost:5001/api/*)
    │
    ├─→ notifications.js (Real-time updates)
    │    └─→ Socket.IO (ws://localhost:5001)
    │
    └─→ integration.js (Business logic)
         └─→ MongoDB (via backend)
```

## Key URLs

| Service | URL |
|---------|-----|
| Website | http://localhost:8000 |
| Backend API | http://localhost:5001/api |
| Socket.IO | ws://localhost:5001 |
| MongoDB | mongodb://localhost:27017 |

## Next Steps

✅ **Completed:**
- Backend server setup
- Frontend integration scripts
- Real-time notifications

🔲 **To Do:**
1. Test all user flows (register → shop → upgrade → custom order)
2. Verify membership discounts apply correctly
3. Test real-time notifications (custom order quotes)
4. Implement Stripe payment processing
5. Create admin dashboard

## Support

- **Backend Docs**: See `backend/README.md`
- **API Reference**: Listed in `backend/README.md` under "API Endpoints"
- **Integration Guide**: See `INTEGRATION_GUIDE.md`

---

**Status**: ✅ Ready to connect!

Start your backend with `npm run dev` in the backend folder, then open the HTML files in your browser.
