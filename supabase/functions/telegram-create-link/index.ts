import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { tg } from '../_shared/telegram.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { device_id, timezone, reminder_time } = await req.json();
    if (!device_id || typeof device_id !== 'string') {
      return new Response(JSON.stringify({ error: 'device_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get bot username
    const me = await tg('getMe');
    const botUsername = me.result.username;

    // Reuse existing link for this device if not yet connected
    const { data: existing } = await supabase
      .from('telegram_links')
      .select('*')
      .eq('device_id', device_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let linkCode: string;
    if (existing && !existing.chat_id) {
      linkCode = existing.link_code;
    } else if (existing && existing.chat_id) {
      // Already connected — return existing
      return new Response(JSON.stringify({
        link_code: existing.link_code,
        chat_id: existing.chat_id,
        bot_username: botUsername,
        url: `https://t.me/${botUsername}?start=${existing.link_code}`,
        already_connected: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      const { data: created, error } = await supabase
        .from('telegram_links')
        .insert({
          device_id,
          timezone: timezone || 'America/Sao_Paulo',
          reminder_time: reminder_time || '20:00',
        })
        .select()
        .single();
      if (error) throw error;
      linkCode = created.link_code;
    }

    return new Response(JSON.stringify({
      link_code: linkCode,
      bot_username: botUsername,
      url: `https://t.me/${botUsername}?start=${linkCode}`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
