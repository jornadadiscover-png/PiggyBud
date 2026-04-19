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

      // If we just removed an old SW, force a reload so the user gets fresh assets.
      if (hadSW) {
        const reloadedKey = "__sw_cleanup_reloaded__";
        if (!sessionStorage.getItem(reloadedKey)) {
          sessionStorage.setItem(reloadedKey, "1");
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
