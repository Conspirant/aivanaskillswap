create or replace function public.delete_all_my_sessions()
returns void as $$
declare
  profile_id_to_delete uuid;
begin
  -- Get the profile ID of the currently authenticated user
  select id into profile_id_to_delete from public.users where auth_user_id = auth.uid();

  -- If a profile exists for the user, delete their sessions
  if profile_id_to_delete is not null then
    delete from public.sessions
    where 
      learner_id = profile_id_to_delete or
      helper_id = profile_id_to_delete;
  end if;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.delete_all_my_sessions() to authenticated; 