# Implementation Plan - Testing and Verification

This plan outlines the steps to verify the server linking and payment integration across the House of Styles platform.

## Proposed Changes

### Verification Tools

#### [NEW] [test-guide.md](file:///Users/apple/Documents/New project/test-guide.md)
- Comprehensive guide for the user to follow to test all features.

## Verification Plan

### Manual Verification
1. **Server Readiness**:
   - Ensure MongoDB is running.
   - Start the backend server.
   - Verify health check endpoint.
2. **Website Testing**:
   - Open `index.html`.
   - Perform user registration.
   - Add products to cart.
   - Proceed to checkout and select Stripe/UPI.
   - Verify toast notifications.
3. **VIP Testing**:
   - Navigate to VIP page.
   - Select a tier and complete payment.
   - Verify discount application on products.
4. **Android App Testing**:
   - Run the app in an emulator.
   - Verify it connects to the local server via `10.0.2.2`.
   - Test the same flows as the website.
