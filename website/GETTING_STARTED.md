# ⚡ Get Running in 60 Seconds

## 3 Steps to Connect Frontend & Backend

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
**Expected:** `🚀 Server running on port 5001`

### Step 2: Start Frontend (Terminal 2)
```bash
python -m http.server 8000
```
Or just open `index.html` in your browser

### Step 3: Test It
Open http://localhost:8000 and:
1. Click "Login / Sign Up"
2. Register with:
   - Name: `Test`
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. You should see products loading from the backend ✅

## That's It!

Now you can:
- ✅ Browse products
- ✅ Add to cart
- ✅ Upgrade membership (VIP page)
- ✅ Create custom orders (Custom Studio)
- ✅ Checkout

## Troubleshooting

**Backend won't start?**
```bash
# Make sure MongoDB is running
mongod

# Then try backend again
cd backend && npm run dev
```

**Products not showing?**
- Press F12 → Console tab
- You should see product data loaded
- If errors, check backend logs

**Real-time updates not working?**
- Refresh the page
- Make sure backend is running
- Check browser console for Socket.IO errors

---

**Need more details?**
- See `QUICK_START.md` for full setup
- See `CONNECTION_MAP.md` for architecture
- See `backend/README.md` for API docs

**Happy coding!** 🎉
