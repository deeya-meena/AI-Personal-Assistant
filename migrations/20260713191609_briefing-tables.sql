CREATE TABLE IF NOT EXISTS public.custom_briefing_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  selected_apps JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  scheduled_time TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  priority_level TEXT NOT NULL DEFAULT 'medium',
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_briefing_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own schedules" ON public.custom_briefing_schedules;
CREATE POLICY "Users can manage their own schedules"
ON public.custom_briefing_schedules
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.generated_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.custom_briefing_schedules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.generated_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own generated briefings" ON public.generated_briefings;
CREATE POLICY "Users can manage their own generated briefings"
ON public.generated_briefings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
