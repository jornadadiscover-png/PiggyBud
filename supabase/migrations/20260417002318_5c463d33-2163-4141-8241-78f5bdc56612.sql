-- Enable extensions for cron + http
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create daily tutor posts table
CREATE TABLE public.daily_tutor_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tip TEXT NOT NULL,
  concept_title TEXT NOT NULL,
  concept_explanation TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_tutor_posts_date ON public.daily_tutor_posts(post_date DESC);

ALTER TABLE public.daily_tutor_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts (gating happens client-side via PremiumGate)
CREATE POLICY "Posts are publicly readable"
ON public.daily_tutor_posts
FOR SELECT
USING (true);

-- Only service role can insert/update (edge function)
CREATE POLICY "Service role can insert posts"
ON public.daily_tutor_posts
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Service role can update posts"
ON public.daily_tutor_posts
FOR UPDATE
USING (false);