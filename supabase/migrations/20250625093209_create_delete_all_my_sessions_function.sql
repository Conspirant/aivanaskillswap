create or replace function public.delete_all_my_sessions()
returns void as $$
begin
  delete from public.sessions
  where sessions.learner_id = auth.uid() or sessions.helper_id = auth.uid();
end;
$$ language plpgsql security definer;
