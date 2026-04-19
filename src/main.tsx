import { createRoot } from "react-dom/client";
import { migrateLocalStorage } from "./lib/data-migration";
import App from "./App.tsx";
import "./index.css";

// Always unregister any existing service workers and clear caches to ensure
// users always get the latest version (no offline cache).
(async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const hadSW = registrations.length > 0;
      await Promise.all(registrations.map((r) => r.unregister()));

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // If we just removed an old SW, force a reload (once per page load) so the user gets fresh assets.
      if (hadSW) {
        const reloadedKey = "__sw_cleanup_reloaded__";
        const last = sessionStorage.getItem(reloadedKey);
        const now = Date.now();
        // Allow reload again after 10s to recover from repeatedly stale caches across sessions.
        if (!last || now - Number(last) > 10000) {
          sessionStorage.setItem(reloadedKey, String(now));
          window.location.reload();
          return;
        }
      }
    }
  } catch (e) {
    // ignore
  }
})();

// Migrate data from FinFunny to Piggy Bud before rendering
migrateLocalStorage();

createRoot(document.getElementById("root")!).render(<App />);
