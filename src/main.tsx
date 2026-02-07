import { createRoot } from "react-dom/client";
import { migrateLocalStorage } from "./lib/data-migration";
import App from "./App.tsx";
import "./index.css";

// Migrate data from FinFunny to Piggy Bud before rendering
migrateLocalStorage();

createRoot(document.getElementById("root")!).render(<App />);
