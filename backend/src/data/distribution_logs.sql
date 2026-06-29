-- Run this in the Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.distribution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    distribution_type TEXT NOT NULL, -- 'initial', 'daily', 'manual'
    section TEXT NOT NULL, -- 'all_matches', 'daily_updates', 'both'
    profiles_added INTEGER NOT NULL DEFAULT 0,
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.distribution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON public.distribution_logs
FOR ALL USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Service Role full access" ON public.distribution_logs
FOR ALL USING (true); -- Usually bypassed by service_role anyway

-- Index for fast sorting by admin
CREATE INDEX IF NOT EXISTS idx_distribution_logs_distributed_at ON public.distribution_logs(distributed_at DESC);
