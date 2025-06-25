drop function if exists public.delete_all_my_sessions();

create or replace function public.delete_all_my_sessions(user_id_to_delete uuid)
returns void as $$
begin
  delete from public.sessions
  where sessions.learner_id = user_id_to_delete or sessions.helper_id = user_id_to_delete;
end;
$$ language plpgsql security definer;
