if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch(() => {
        // Keep the storefront usable even if offline support is unavailable.
      });
  });
}
