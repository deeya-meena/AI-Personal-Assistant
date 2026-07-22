-- =============================================================
-- Alerts Feature Tables
-- =============================================================

-- 1. user_alerts: Stores user-defined alert rules/configurations
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  selected_apps JSONB NOT NULL DEFAULT '[]'::jsonb,
  trigger_condition TEXT NOT NULL DEFAULT 'keyword_match',
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium',
  notification_method TEXT NOT NULL DEFAULT 'in_app',
  frequency TEXT NOT NULL DEFAULT 'realtime',
  action_type TEXT NOT NULL DEFAULT 'notify',
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own alert rules" ON public.user_alerts;
CREATE POLICY "Users can manage their own alert rules"
ON public.user_alerts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. triggered_alerts: Stores each triggered alert instance
CREATE TABLE IF NOT EXISTS public.triggered_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.user_alerts(id) ON DELETE SET NULL,
  source_app TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  full_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  snoozed_until TIMESTAMP WITH TIME ZONE,
  ai_summary TEXT,
  ai_suggested_action TEXT,
  ai_draft_reply TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.triggered_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own triggered alerts" ON public.triggered_alerts;
CREATE POLICY "Users can manage their own triggered alerts"
ON public.triggered_alerts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_user_status ON public.triggered_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_user_priority ON public.triggered_alerts(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_created ON public.triggered_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_active ON public.user_alerts(user_id, is_active);
