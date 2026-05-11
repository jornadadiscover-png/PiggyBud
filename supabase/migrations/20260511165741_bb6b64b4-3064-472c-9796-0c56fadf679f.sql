CREATE TABLE public.telegram_links (
  link_code uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id uuid NOT NULL,
  chat_id bigint,
  daily_enabled boolean NOT NULL DEFAULT true,
  weekly_enabled boolean NOT NULL DEFAULT true,
  reminder_time text NOT NULL DEFAULT '20:00',
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  last_daily_sent_date date,
  last_weekly_sent_week text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_links_device_id ON public.telegram_links(device_id);
CREATE INDEX idx_telegram_links_chat_id ON public.telegram_links(chat_id);

ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

-- Public access (no auth in app); writes/reads are by link_code/device_id known only to client
CREATE POLICY "Public can read telegram_links"
  ON public.telegram_links FOR SELECT
  USING (true);

CREATE POLICY "Public can insert telegram_links"
  ON public.telegram_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update telegram_links"
  ON public.telegram_links FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete telegram_links"
  ON public.telegram_links FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_telegram_links_updated_at
  BEFORE UPDATE ON public.telegram_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;