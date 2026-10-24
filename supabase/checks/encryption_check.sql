select
  (select count(*) from auth.users) as users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from public.profiles where age_confirmed) as age_confirmed,
  (select count(*) from public.chats) as chats,
  (select count(*) from public.messages where role = 'user') as your_messages,
  (select count(*) from public.messages where role = 'assistant') as lytt_replies,
  (select bool_and(title_enc ~ '^v1:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$') from public.chats) as titles_encrypted,
  (select bool_and(content_enc ~ '^v1:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$') from public.messages) as messages_encrypted,
  (select left(content_enc, 30) || '...' from public.messages order by created_at limit 1) as sample;
