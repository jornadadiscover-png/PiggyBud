# Lembretes via Telegram Bot

Conexão Telegram já está linkada ao projeto. Vamos construir o fluxo completo de vinculação do usuário ao bot e disparo automático de lembretes.

## Fluxo do usuário

1. Em **Configurações**, surge um card "Telegram" com botão **Conectar ao Telegram**.
2. Ao clicar, geramos um código único e abrimos `https://t.me/<bot>?start=<code>`.
3. O usuário toca em "Iniciar" no Telegram → o bot recebe `/start <code>` → vincula o `chat_id` ao `device_id` local.
4. O app faz polling curto (10s) e mostra "Conectado ✓".
5. Toggles de "Lembrete diário" e "Resumo semanal" passam a salvar no backend (continuam funcionando localmente também).
6. Cron roda a cada 5 min e dispara mensagens nos horários configurados (respeitando timezone).

## Mudanças técnicas

### Backend (Lovable Cloud)

**Tabela `telegram_links`** (RLS pública, filtrada por `device_id`):
- `link_code` (uuid, PK), `chat_id` (bigint, nullable), `device_id` (uuid)
- `daily_enabled`, `weekly_enabled` (bool)
- `reminder_time` (text, "HH:MM"), `timezone` (text)
- `last_daily_sent_date` (date), `last_weekly_sent_week` (text)
- `created_at`

**Edge Functions**:
- `telegram-webhook` (verify_jwt=false) — recebe `/start <code>` e grava `chat_id`. Valida `X-Telegram-Bot-Api-Secret-Token` (SHA-256 derivado de `TELEGRAM_API_KEY`).
- `telegram-create-link` — cria registro com `device_id` + `link_code`, retorna URL do bot.
- `telegram-check-link` — polling para saber se já vinculou.
- `telegram-update-prefs` — atualiza toggles/horário/timezone.
- `telegram-send-reminders` — chamado pelo cron, varre `telegram_links` e envia diários/semanais devidos.

**Cron** (`pg_cron` + `pg_net`): a cada 5 min chama `telegram-send-reminders`.

**Setup do webhook**: após deploy, registrar via gateway (`setWebhook`) apontando para a função.

### Frontend
- `src/lib/telegram-link.ts` — helpers (`device_id` em localStorage, criar link, abrir Telegram, polling, salvar prefs).
- `src/pages/ConfigPage.tsx` — novo card "Telegram" com status (Conectado / Não conectado), botão conectar/desconectar; toggles existentes passam a também sincronizar prefs no backend.

### Mensagens
- **Diário**: texto curto reusando o tom de `src/lib/reminders.ts` ("Hora de registrar seus gastos do dia 🐷").
- **Semanal**: como o servidor não tem acesso aos dados locais (tudo é local), envia mensagem genérica ("Domingo é dia de revisar a semana — abra o app para ver o resumo").

### Considerações
- Sem auth de usuário: vínculo é por `device_id` salvo em `localStorage`. Se limpar storage, perde o vínculo (precisa reconectar).
- Push notifications atuais permanecem inalterados (opcionais, paralelos).
- Nome do bot precisa ser conhecido para montar a URL `t.me/<bot>?start=…`. Vou obter via `getMe` na função `telegram-create-link` e cachear.

## Arquivos afetados
- novo: `supabase/functions/telegram-webhook/index.ts`
- novo: `supabase/functions/telegram-create-link/index.ts`
- novo: `supabase/functions/telegram-check-link/index.ts`
- novo: `supabase/functions/telegram-update-prefs/index.ts`
- novo: `supabase/functions/telegram-send-reminders/index.ts`
- novo: `src/lib/telegram-link.ts`
- editado: `src/pages/ConfigPage.tsx`
- editado: `supabase/config.toml` (verify_jwt=false para webhook)
- migração: criar tabela `telegram_links`
- insert SQL: agendar cron
