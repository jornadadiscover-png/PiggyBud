import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { tg } from '../_shared/telegram.ts';

// Returns {date: 'YYYY-MM-DD', hour, minute, dow} in the given timezone
function nowInTz(tz: string) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dow = dowMap[get('weekday')] ?? 0;
  // Year-week
  const d = new Date(date + 'T00:00:00Z');
  const onejan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7);
  const weekKey = `${d.getUTCFullYear()}-W${week}`;
  return { date, hour, minute, dow, weekKey };
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: links, error } = await supabase
      .from('telegram_links')
      .select('*')
      .not('chat_id', 'is', null);
    if (error) throw error;

    let sent = 0;
    for (const link of links || []) {
      const tz = link.timezone || 'America/Sao_Paulo';
      const t = nowInTz(tz);
      const [rh, rm] = (link.reminder_time || '20:00').split(':').map((n: string) => parseInt(n, 10));

      // Daily: fire if current time is within 5 min after configured time and not yet sent today
      if (link.daily_enabled) {
        const targetMin = rh * 60 + rm;
        const nowMin = t.hour * 60 + t.minute;
        const diff = nowMin - targetMin;
        if (diff >= 0 && diff < 10 && link.last_daily_sent_date !== t.date) {
          try {
            await tg('sendMessage', {
              chat_id: link.chat_id,
              text: '🐷 Hora de fechar o caixa do dia! Registre seus gastos no Piggy Bud antes de dormir.',
            });
            await supabase
              .from('telegram_links')
              .update({ last_daily_sent_date: t.date })
              .eq('link_code', link.link_code);
            sent++;
          } catch (e) {
            console.error('daily send failed', link.chat_id, e);
          }
        }
      }

      // Weekly: Sunday at 20:00 local, once per week
      if (link.weekly_enabled && t.dow === 0) {
        const targetMin = 20 * 60;
        const nowMin = t.hour * 60 + t.minute;
        const diff = nowMin - targetMin;
        if (diff >= 0 && diff < 10 && link.last_weekly_sent_week !== t.weekKey) {
          try {
            await tg('sendMessage', {
              chat_id: link.chat_id,
              text: '📊 Domingo de revisão! Abra o Piggy Bud para ver o resumo da sua semana 🐷',
            });
            await supabase
              .from('telegram_links')
              .update({ last_weekly_sent_week: t.weekKey })
              .eq('link_code', link.link_code);
            sent++;
          } catch (e) {
            console.error('weekly send failed', link.chat_id, e);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, total: links?.length ?? 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
