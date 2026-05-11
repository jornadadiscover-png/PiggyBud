export const TELEGRAM_GATEWAY = 'https://connector-gateway.lovable.dev/telegram';

export function getTelegramHeaders() {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
  if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY not configured');
  return {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': TELEGRAM_API_KEY,
    'Content-Type': 'application/json',
  };
}

export async function tg(method: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${TELEGRAM_GATEWAY}/${method}`, {
    method: 'POST',
    headers: getTelegramHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Telegram ${method} failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function deriveTelegramWebhookSecret(): Promise<string> {
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY')!;
  const data = new TextEncoder().encode(`telegram-webhook:${TELEGRAM_API_KEY}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
