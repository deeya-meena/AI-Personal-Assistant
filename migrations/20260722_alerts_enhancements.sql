-- =============================================================
-- Alerts Schema Enhancements
-- =============================================================

-- 1. Alter triggered_alerts table to drop individual AI columns and add single ai_data JSONB
ALTER TABLE public.triggered_alerts
  DROP COLUMN IF EXISTS ai_summary,
  DROP COLUMN IF EXISTS ai_suggested_action,
  DROP COLUMN IF EXISTS ai_draft_reply;

ALTER TABLE public.triggered_alerts
  ADD COLUMN IF NOT EXISTS ai_data JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Add source_id, dedupe_key and archived_at
ALTER TABLE public.triggered_alerts
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add UNIQUE constraint to dedupe_key (ignore null or allow unique constraints)
-- In Postgres, unique constraints allow multiple NULLs, which is perfect for alerts that don't have dedupe_key.
ALTER TABLE public.triggered_alerts
  DROP CONSTRAINT IF EXISTS triggered_alerts_dedupe_key_key;

ALTER TABLE public.triggered_alerts
  ADD CONSTRAINT triggered_alerts_dedupe_key_key UNIQUE (dedupe_key);

-- Add index on archived_at and dedupe_key
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_archived_at ON public.triggered_alerts(archived_at);
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_dedupe_key ON public.triggered_alerts(dedupe_key);
