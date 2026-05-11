import { supabase } from '@/integrations/supabase/client';

const DEVICE_KEY = 'piggy-bud-telegram-device-id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function tz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch {
    return 'America/Sao_Paulo';
  }
}

export interface TelegramLinkStatus {
  connected: boolean;
  link: {
    link_code: string;
    chat_id: number | null;
    daily_enabled: boolean;
    weekly_enabled: boolean;
    reminder_time: string;
    timezone: string;
  } | null;
}

export async function checkTelegramLink(): Promise<TelegramLinkStatus> {
  const device_id = getDeviceId();
  const { data, error } = await supabase.functions.invoke('telegram-check-link', {
    method: 'GET' as never,
    // supabase-js doesn't pass query for GET; use custom URL fetch instead
  } as never);
  if (!error && data) return data as TelegramLinkStatus;
  // Fallback to direct fetch with query string
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-check-link?device_id=${encodeURIComponent(device_id)}`;
  const res = await fetch(url, {
    headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string },
  });
  return await res.json();
}

export async function createTelegramLink(reminder_time?: string): Promise<{
  url: string;
  link_code: string;
  bot_username: string;
  already_connected?: boolean;
}> {
  const { data, error } = await supabase.functions.invoke('telegram-create-link', {
    body: { device_id: getDeviceId(), timezone: tz(), reminder_time },
  });
  if (error) throw error;
  return data;
}

export async function updateTelegramPrefs(prefs: {
  daily_enabled?: boolean;
  weekly_enabled?: boolean;
  reminder_time?: string;
  timezone?: string;
}) {
  const { error } = await supabase.functions.invoke('telegram-update-prefs', {
    body: { device_id: getDeviceId(), ...prefs, timezone: prefs.timezone ?? tz() },
  });
  if (error) throw error;
}

export async function disconnectTelegram() {
  const { error } = await supabase.functions.invoke('telegram-update-prefs', {
    body: { device_id: getDeviceId(), disconnect: true },
  });
  if (error) throw error;
}
