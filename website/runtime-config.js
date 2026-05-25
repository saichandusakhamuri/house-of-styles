/* Runtime config for production deployments (Render, etc.)
 *
 * This file is loaded before api-client.js / notifications.js.
 * It is intentionally static (no build step) and adds payment defaults on every host.
 */
(function () {
  try {
    const host = window.location.hostname || '';
    const protocol = window.location.protocol;
    const merchantConfig = {
      merchantName: 'House of Styles',
      merchantUpiId: 'houseofstyles@upi',
      razorpayKeyId: '',
      razorpayOrderEndpoint: '',
      razorpayVerifyEndpoint: '',
    };

    if (window.HOS_CONFIG) {
      window.HOS_CONFIG = {
        ...merchantConfig,
        ...window.HOS_CONFIG,
      };
      return;
    }

    // Keep local dev + Android WebView behavior unchanged.
    if (
      protocol === 'file:' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local')
    ) {
      window.HOS_CONFIG = merchantConfig;
      return;
    }

    // Render backend service URL (update if you rename the service or add a custom domain).
    const backendOrigin = 'https://house-of-styles-backend.onrender.com';

    window.HOS_CONFIG = {
      ...merchantConfig,
      apiBaseUrl: backendOrigin + '/api',
      socketUrl: backendOrigin,
      razorpayOrderEndpoint: backendOrigin + '/api/payments/razorpay-order',
      razorpayVerifyEndpoint: backendOrigin + '/api/payments/razorpay-verify',
    };
  } catch (error) {
    // Never block page load if config fails.
    console.warn('runtime-config failed:', error);
  }
})();
