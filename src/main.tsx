import { createRoot } from "react-dom/client";
import { migrateLocalStorage } from "./lib/data-migration";
import { initReminders } from "./lib/reminders";
import { useSettingsStore } from "./stores/useSettingsStore";
import App from "./App.tsx";
import "./index.css";

const BUILD_ID = "2026-05-02T00-00-00Z-003";

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

// Apply persisted theme as early as possible to avoid flash.
try {
  const theme = useSettingsStore.getState().settings.theme || "default";
  document.documentElement.dataset.theme = theme;
} catch {
  // ignore
}

// Subscribe so theme updates from anywhere apply instantly.
useSettingsStore.subscribe((state) => {
  const theme = state.settings.theme || "default";
  if (document.documentElement.dataset.theme !== theme) {
    document.documentElement.dataset.theme = theme;
  }
});

// Schedule local reminders (daily + weekly summary).
initReminders();

createRoot(document.getElementById("root")!).render(<App />);
