import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const device_id = url.searchParams.get('device_id');
    if (!device_id) {
      return new Response(JSON.stringify({ error: 'device_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data } = await supabase
      .from('telegram_links')
      .select('link_code, chat_id, daily_enabled, weekly_enabled, reminder_time, timezone')
      .eq('device_id', device_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return new Response(JSON.stringify({
      connected: !!data?.chat_id,
      link: data || null,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
