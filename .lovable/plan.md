# Lembretes via Telegram Bot

Substituir (ou complementar) as push notifications por mensagens de um bot do Telegram, agendadas no servidor via cron — assim o lembrete chega mesmo com o app fechado.

## Como vai funcionar para o usuário

1. Em **Configurações → Lembretes**, o usuário vê um novo bloco "Telegram".
2. Clica em "Conectar Telegram" → app abre o bot (`t.me/SeuBot?start=<código>`).
3. Usuário envia `/start` no Telegram. O bot registra o `chat_id` dele associado ao código.
4. App detecta a vinculação (polling no Supabase) e mostra "✅ Conectado".
5. Usuário escolhe horário do lembrete diário e ativa/desativa resumo semanal.
6. Servidor envia as mensagens nos horários certos, sem depender do celular estar com o app aberto.

## Conexão Telegram necessária

Vou pedir para você conectar o **Telegram** como connector na próxima etapa (ou já pode conectar agora). Você precisará ter criado um bot via [@BotFather](https://t.me/BotFather) e ter o token em mãos.

## Mudanças técnicas

### Backend (Lovable Cloud)

**Tabelas novas:**
- `telegram_links` — `link_code` (UUID curto), `chat_id` (bigint, null até vincular), `device_id` (UUID gerado no cliente, identifica o "usuário" local), `daily_enabled`, `weekly_enabled`, `reminder_time` (HH:MM), `timezone`, `last_daily_sent_date`, `last_weekly_sent_week`, `created_at`.
- RLS: leitura/escrita pública apenas filtrando por `device_id` (passado no cliente). Sem auth porque o app é 100% local.

**Edge functions:**
- `telegram-webhook` (verify_jwt=false): recebe `/start <código>` do Telegram, salva o `chat_id` na linha do `link_code`. Valida `X-Telegram-Bot-Api-Secret-Token`.
- `telegram-create-link`: cria uma nova linha em `telegram_links` e devolve `link_code` + URL `https://t.me/<bot>?start=<código>`.
- `telegram-check-link`: dado um `link_code`, devolve se já tem `chat_id` (para o app saber que conectou).
- `telegram-update-prefs`: atualiza horário/flags do usuário.
- `telegram-send-reminders`: chamada pelo cron a cada 5 min. Busca registros onde `daily_enabled=true` e horário local atual ≈ `reminder_time` e ainda não enviou hoje; envia via gateway. Mesma lógica para semanal (domingo 20:00).

**Cron (pg_cron + pg_net):** roda `telegram-send-reminders` a cada 5 minutos.

### Frontend

- `src/pages/ConfigPage.tsx`: novo card "Telegram" com botão Conectar, status, e (quando conectado) os controles existentes de horário/diário/semanal passam a salvar também no Supabase.
- `src/lib/telegram-link.ts`: helpers para criar link, abrir Telegram, fazer polling de check-link, salvar `device_id` em localStorage.
- Push notifications atuais ficam como estão (opcional), só adicionamos o canal Telegram em paralelo.

## Pontos de atenção

- **Mensagens de template**: o conteúdo do lembrete diário e do resumo semanal será o mesmo texto que já existe em `src/lib/reminders.ts`. O resumo semanal hoje calcula valores a partir do `useTransactionStore` (local). Como o servidor não tem acesso a esses dados, o resumo via Telegram será genérico ("Domingo é dia de revisar a semana 🐷, abra o app"). Posso, alternativamente, deixar o resumo detalhado só na versão local do app.
- **Fuso horário**: salvamos `timezone` do navegador (`Intl.DateTimeFormat().resolvedOptions().timeZone`) para o cron disparar no horário local correto.
- **Sem auth**: usar `device_id` em localStorage funciona, mas se o usuário limpar o storage perde o vínculo — terá que reconectar.

## Pergunta antes de começar

Você já tem um bot criado no @BotFather? Se sim, tenha o token pronto — vou pedir para conectar via connector do Telegram. Se não, posso te guiar a criar um (leva ~1 min).
