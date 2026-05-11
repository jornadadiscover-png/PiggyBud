import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { tg, deriveTelegramWebhookSecret } from '../_shared/telegram.ts';

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const expectedSecret = await deriveTelegramWebhookSecret();
    const actualSecret = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (!safeEqual(actualSecret, expectedSecret)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const update = await req.json();
    const message = update.message ?? update.edited_message;
    const chatId = message?.chat?.id as number | undefined;
    const text = (message?.text ?? '') as string;

    if (!chatId) return new Response(JSON.stringify({ ok: true }));

    // Handle /start <code>
    if (text.startsWith('/start')) {
      const parts = text.trim().split(/\s+/);
      const code = parts[1];
      if (code) {
        const { data: link, error } = await supabase
          .from('telegram_links')
          .update({ chat_id: chatId })
          .eq('link_code', code)
          .is('chat_id', null)
          .select()
          .maybeSingle();

        if (!error && link) {
          await tg('sendMessage', {
            chat_id: chatId,
            text: '🐷 Conectado ao Piggy Bud! Você receberá lembretes por aqui. Use /stop para desativar.',
          });
        } else {
          // Try linking anyway by code (idempotent)
          const { data: existing } = await supabase
            .from('telegram_links')
            .select()
            .eq('link_code', code)
            .maybeSingle();
          if (existing) {
            await supabase.from('telegram_links').update({ chat_id: chatId }).eq('link_code', code);
            await tg('sendMessage', { chat_id: chatId, text: '🐷 Conexão atualizada!' });
          } else {
            await tg('sendMessage', { chat_id: chatId, text: 'Código inválido. Abra o app e gere um novo link.' });
          }
        }
      } else {
        await tg('sendMessage', {
          chat_id: chatId,
          text: 'Olá! Para conectar, abra o app Piggy Bud → Configurações → Telegram → Conectar.',
        });
      }
    } else if (text === '/stop') {
      await supabase
        .from('telegram_links')
        .update({ daily_enabled: false, weekly_enabled: false })
        .eq('chat_id', chatId);
      await tg('sendMessage', { chat_id: chatId, text: 'Lembretes desativados. Reative no app quando quiser.' });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('webhook error:', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 200 });
  }
});
