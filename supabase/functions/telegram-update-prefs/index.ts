import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { device_id, daily_enabled, weekly_enabled, reminder_time, timezone, disconnect } = body;
    if (!device_id) {
      return new Response(JSON.stringify({ error: 'device_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (disconnect) {
      await supabase.from('telegram_links').delete().eq('device_id', device_id);
      return new Response(JSON.stringify({ ok: true, disconnected: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const update: Record<string, unknown> = {};
    if (typeof daily_enabled === 'boolean') update.daily_enabled = daily_enabled;
    if (typeof weekly_enabled === 'boolean') update.weekly_enabled = weekly_enabled;
    if (typeof reminder_time === 'string') update.reminder_time = reminder_time;
    if (typeof timezone === 'string') update.timezone = timezone;

    const { error } = await supabase
      .from('telegram_links')
      .update(update)
      .eq('device_id', device_id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
