
-- Create feedback table for session ratings
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for session issues
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('no-show', 'fake-user', 'payment-scam', 'inappropriate-behavior')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback they're involved in" 
  ON public.feedback 
  FOR SELECT 
  USING (
    from_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR 
    to_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can create feedback for their sessions" 
  ON public.feedback 
  FOR INSERT 
  WITH CHECK (from_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Add RLS policies for reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" 
  ON public.reports 
  FOR SELECT 
  USING (from_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create reports for their sessions" 
  ON public.reports 
  FOR INSERT 
  WITH CHECK (from_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Add timezone field to users table for better UX
ALTER TABLE public.users ADD COLUMN timezone TEXT DEFAULT 'UTC';
