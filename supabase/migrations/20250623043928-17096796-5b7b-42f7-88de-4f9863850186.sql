
-- Create sessions table for booking functionality
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_card_id UUID NOT NULL REFERENCES public.skill_cards(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  meeting_link TEXT NOT NULL,
  session_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Users can view sessions they're involved in (as learner or helper)
CREATE POLICY "Users can view their own sessions" 
  ON public.sessions 
  FOR SELECT 
  USING (
    learner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR 
    helper_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Users can create sessions as learners
CREATE POLICY "Users can create sessions as learners" 
  ON public.sessions 
  FOR INSERT 
  WITH CHECK (learner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Users can update sessions they're involved in
CREATE POLICY "Users can update their sessions" 
  ON public.sessions 
  FOR UPDATE 
  USING (
    learner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR 
    helper_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Add trigger for updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
