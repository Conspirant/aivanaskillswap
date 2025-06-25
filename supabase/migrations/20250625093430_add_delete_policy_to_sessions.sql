CREATE POLICY "Users can delete their own sessions"
  ON public.sessions
  FOR DELETE
  USING (
    learner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR 
    helper_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );
