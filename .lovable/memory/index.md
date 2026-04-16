# Project Memory

## Core
React, Vite, Capacitor, Zustand. Data is 100% local (localStorage/IndexedDB).
App is Piggy Bud. 3D pig mascot reacts: <R$20 happy, >R$200 dramatic.
Visuals: Purple/green gradients, mint green. Mascot icons must be `rounded-xl`, NOT circles.
UI: No generic 🐷 emojis. Use `break-words` in cards, avoid truncation.
Security: 4-6 digit local PIN.
Stripe Premium checkout must `refreshSession` before edge function call.
Premium features: advanced-reports, export-pdf, exclusive-challenges, ai-import, ai-summary, premium-themes.
No automatic notification reading (removed). Manual entry + paste + AI file import only.

## Memories
- [Core Concept](mem://projeto/visao-geral) — App overview and mascot interaction concept
- [Personality Engine](mem://funcionalidades/motor-de-personalidade) — Reaction thresholds for spending
- [Editable Spreadsheet](mem://funcionalidades/planilha-editavel) — Excel-style grid for advanced manual management
- [Local PIN Protection](mem://seguranca/protecao-local) — 4-6 digit local PIN security
- [Visual Identity](mem://estilo/identidade-visual) — Purple/green gradients and mascot avatar rules
- [Gamification](mem://funcionalidades/gamificacao) — Achievements and monthly challenges
- [Reports & Export](mem://funcionalidades/relatorios-e-exportacao) — Report filtering rules and export features
- [Mascot UI Rules](mem://funcionalidades/mascote-e-engajamento) — UI constraints for mascot, emojis, and text wrapping
- [PWA and Offline](mem://tecnologia/pwa-e-offline) — vite-plugin-pwa setup and installation guide
- [Profile Customization](mem://funcionalidades/perfil-e-personalizacao) — Profile picture image processing rules
- [Budget & Health](mem://funcionalidades/orcamento-e-saude-financeira) — Spending limits and 0-100 health score logic
- [Data Migration](mem://tecnologia/migracao-de-dados) — LocalStorage key migration script
- [Premium Plan](mem://monetizacao/plano-premium) — Stripe checkout, prices, and Premium unlock rules
