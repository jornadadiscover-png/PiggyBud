## Diagnóstico

Confirmei lendo o código:

1. **Premium bloqueia funções** — `usePremiumStore.canAccess()` retorna `false` quando o usuário não é assinante. Tudo passa por essa única porta (`PremiumGate`, `BottomNav`, `RelatoriosPage`, `TutorPage`, etc.).
2. **Temas não funcionam** — em `ConfigPage.tsx` o clique em um tema só chama `setSelectedTheme` (estado local) e mostra um toast. Não aplica nenhuma classe/variável CSS, não persiste, não muda nada visualmente.
3. **Lembretes diários e resumo semanal não chegam** — as flags `dailyReminderEnabled` / `weeklyReportEnabled` / `reminderTime` existem em `useSettingsStore`, são exibidas em `ConfigPage`, mas **nenhum código as consome**. Não há `Notification` API, nem agendamento, nem worker. Toggles são puramente decorativos hoje.

## Plano

### 1. Liberar tudo como gratuito
- Em `src/stores/usePremiumStore.ts`, fazer `canAccess()` sempre retornar `true`. Isso desbloqueia, de uma só vez: relatórios avançados, export PDF, desafios exclusivos, importação por IA, resumo IA, temas premium e Tutor diário — sem precisar tocar em cada tela.
- Em `src/components/PremiumGate.tsx`, manter o componente mas, como `canAccess` agora é sempre `true`, ele simplesmente renderiza o conteúdo. Sem efeito colateral.
- Em `src/components/BottomNav.tsx` e demais telas, remover/ocultar os badges "PRO" visuais para não confundir o usuário (o app deixa de mostrar "Premium" como diferenciador). A página `PremiumPage` continua existindo, mas vou esconder o item de menu que leva a ela em `MaisPage` e remover CTAs "Ver Premium". A integração Stripe permanece no código, intocada, pronta para ser reativada depois quando você definir o que vai justificar a cobrança.

### 2. Temas que funcionam de verdade
- Adicionar `theme: 'default' | 'dark' | 'ocean' | 'sunset'` em `AppSettings` e persistir via `useSettingsStore`.
- Criar 4 conjuntos de variáveis HSL em `src/index.css` usando seletor `[data-theme="ocean"]`, `[data-theme="sunset"]`, `[data-theme="dark"]` (o "default" continua o atual). Vou redefinir apenas tokens semânticos (`--primary`, `--accent`, `--background`, etc.) — sem mexer em layout, espaçamento ou tipografia.
- Em `src/main.tsx` (ou um hook novo `useApplyTheme`), ler o tema do store no boot e aplicar `document.documentElement.dataset.theme = settings.theme`. Reaplicar quando muda.
- Em `ConfigPage.tsx`, trocar o `useState` local pelo valor do store; ao clicar, chamar `updateSettings({ theme: id })` e o efeito acima aplica imediatamente. Toast continua.

### 3. Lembretes e resumo semanal de verdade
Como o app é 100% local (sem backend de push) e roda como PWA + Capacitor, vou usar **notificações locais agendadas no próprio dispositivo**:

- Criar `src/lib/reminders.ts`:
  - `requestNotificationPermission()` — pede permissão na primeira ativação do toggle.
  - `scheduleDailyReminder(time)` — calcula o próximo horário (ex.: 20:00) e usa `setTimeout` + reagenda a cada disparo. Persistir o último disparo em `localStorage` para não duplicar quando o usuário reabre o app.
  - `scheduleWeeklyReport()` — domingo à noite (20:00), mesma lógica. O conteúdo da notificação resume saldo, total gasto e categoria campeã da semana lendo `useTransactionStore` direto.
  - Como `setTimeout` não sobrevive ao app fechado no navegador, também faço **catch-up no boot**: se a hora alvo do dia já passou e o usuário ainda não foi notificado hoje, disparo na hora em que ele abrir o app (ex.: "Boa noite! Vamos fechar o caixa de hoje?").
- Em `src/main.tsx`, após hidratar o store, chamar um `initReminders()` que lê as flags e agenda o que estiver ligado.
- Em `ConfigPage.tsx`, ao ligar o toggle, chamar `requestNotificationPermission()` e reagendar. Ao desligar, cancelar.
- Para PWA instalado, isso já funciona via `new Notification(...)` quando o app está aberto/em background recente. Vou registrar também via `ServiceWorkerRegistration.showNotification` quando disponível, sem mexer no SW de kill-switch existente — adiciono apenas um `sw-notifications.js` separado se necessário, ou reaproveito o registration atual.

> Limitação honesta: notificações push 100% confiáveis com app totalmente fechado exigiriam backend (Web Push + servidor) ou Capacitor LocalNotifications no app nativo. Este plano cobre web/PWA com a abordagem local + catch-up. Se você quiser empurrar para o app nativo Android/iOS depois, plugamos `@capacitor/local-notifications` num próximo passo.

### 4. Não mexer em
- Lógica de PIN, transações, mascote, Calculadora, Tutor, Stripe (mantido em standby), service workers de cache, fluxo de auth.

## Arquivos afetados

- `src/stores/usePremiumStore.ts` — `canAccess` sempre `true`.
- `src/components/BottomNav.tsx`, `src/pages/MaisPage.tsx`, `src/pages/RelatoriosPage.tsx`, `src/pages/TutorPage.tsx`, `src/components/ChallengesCard.tsx`, `src/components/PasteNotificationDialog.tsx`, `src/pages/PerfilPage.tsx` — remover badges/CTAs "PRO" visíveis.
- `src/types/index.ts` — adicionar `theme` em `AppSettings`.
- `src/stores/useSettingsStore.ts` — default `theme: 'default'`.
- `src/index.css` — variáveis HSL para `[data-theme="dark|ocean|sunset"]`.
- `src/pages/ConfigPage.tsx` — temas conectados ao store; toggles de lembrete chamando o agendador.
- `src/lib/reminders.ts` — novo, agendamento + catch-up.
- `src/main.tsx` — `initReminders()` e aplicação de tema no boot.
