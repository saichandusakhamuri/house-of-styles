/* Runtime config for production deployments (Render, etc.)
 *
 * This file is loaded before api-client.js / notifications.js.
 * It is intentionally static (no build step) and only activates on non-local hosts.
 */
(function () {
  try {
    const host = window.location.hostname || '';
    const protocol = window.location.protocol;

    // Keep local dev + Android WebView behavior unchanged.
    if (
      protocol === 'file:' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local')
    ) {
      return;
    }

    // Allow a custom override from elsewhere.
    if (window.HOS_CONFIG) return;

    // Render backend service URL (update if you rename the service or add a custom domain).
    const backendOrigin = 'https://house-of-styles-backend.onrender.com';

    window.HOS_CONFIG = {
      apiBaseUrl: backendOrigin + '/api',
      socketUrl: backendOrigin,
    };
  } catch (error) {
    // Never block page load if config fails.
    console.warn('runtime-config failed:', error);
  }
})();

