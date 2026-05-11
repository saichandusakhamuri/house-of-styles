# 🧪 House of Styles - Testing Guide

Follow these steps to verify the full integration of the server, payments, and real-time features.

## 1. Prerequisites
Ensure you have the following running on your machine:
- **MongoDB**: `brew services start mongodb-community` (macOS) or start the service on Windows.
- **Node.js**: Version 16 or higher.

## 2. Start the Backend Server
```bash
cd website/backend
npm install
# Make sure your .env has: 
# JWT_SECRET=your_super_secret_key
# STRIPE_SECRET_KEY=sk_test_... (optional for mock testing)
npm run dev
```
Verify the server is up by visiting: `http://localhost:5001/api/health`

## 3. Test the Website (Browser)
1. **Open the site**: Open `website/index.html` in Chrome or VS Code Live Server.
2. **Sign Up**: Click "Login / Sign Up", switch to "Sign Up", and create a new account.
   - *Look for:* A success toast notification at the bottom.
3. **Shopping**:
   - Browse products (they should load from the database).
   - Add 2-3 items to your bag.
   - Open the bag and click **Proceed to Checkout**.
4. **Payment**:
   - Select **Stripe** or **UPI**.
   - For **UPI**: Enter `test@upi` and click Initiate. Wait 3 seconds for the simulated confirmation.
   - *Look for:* "Payment successful! Order confirmed" toast and the cart clearing.
5. **VIP Club**:
   - Go to the VIP page.
   - Click "Choose Gold" or "Choose Platinum".
   - Complete the payment.
   - Go back to the main shop - notice the product prices have decreased (VIP discount applied)!

## 4. Test the Android App (Emulator)
1. **Sync Assets**:
   ```bash
   node website/copy-to-android.js
   ```
2. **Run the App**: Open the `android-app/HouseOfStylesApp` in Android Studio and run it on an emulator.
3. **Connectivity**: The app is configured to use `10.0.2.2:5001` to talk to your local server.
4. **Test the same flow**: Login, Shop, and Pay. The experience should be identical to the website.

## 5. Verify Real-time Notifications
1. Open the website in one window and log in.
2. Open the browser console (F12).
3. When you complete a payment, you should see a "Order confirmed" message in the console and a toast on screen, triggered via **Socket.IO**.

## 📁 Key Files to Check
- `website/api-client.js`: Handles API calls (auto-detects local vs emulator).
- `website/backend/routes/payments.js`: New payment endpoints.
- `website/integration.js`: Main logic for cart and checkout.
- `website/notifications.js`: Socket.IO listener.
