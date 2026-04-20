import { createRoot } from "react-dom/client";
import { migrateLocalStorage } from "./lib/data-migration";
import App from "./App.tsx";
import "./index.css";

const BUILD_ID = "2026-04-20T02-30-00Z-002";

// Expose build id for quick diagnostics
try {
  (window as unknown as { __PIGGYBUD_BUILD__?: string }).__PIGGYBUD_BUILD__ = BUILD_ID;
  console.info("[PiggyBud] runtime build:", BUILD_ID);
} catch {
  // ignore
}

// Always unregister any existing service workers and clear caches to ensure
// users always get the latest version (no offline cache).
(async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // ignore
  }
})();

// Migrate data from FinFunny to Piggy Bud before rendering
migrateLocalStorage();

createRoot(document.getElementById("root")!).render(<App />);
