
-- Create the skill_cards table for AIVana SkillSwap
CREATE TABLE public.skill_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  skill_offered TEXT NOT NULL,
  skill_needed TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  price INTEGER,
  language TEXT NOT NULL,
  availability TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.skill_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for skill_cards table
CREATE POLICY "Anyone can view active skill cards" 
  ON public.skill_cards 
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Users can insert their own skill cards" 
  ON public.skill_cards 
  FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can update their own skill cards" 
  ON public.skill_cards 
  FOR UPDATE 
  USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can delete their own skill cards" 
  ON public.skill_cards 
  FOR DELETE 
  USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_skill_cards_updated_at 
  BEFORE UPDATE ON public.skill_cards 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
