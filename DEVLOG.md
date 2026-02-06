# Stratlife Devlog

## Day 3 status (end)
- Supabase project created, keys in .env.local (not committed)
- Data API enabled
- wins table created with RLS policies (CRUD own rows)
- App has AuthProvider + login route
- Current blocker: Supabase auth email rate limit (cooldown needed)

## Tomorrow (Day 3 continuation)
1) Retry sign-in (once) after cooldown
2) If magic link still painful, switch to OTP code flow
3) Implement create win -> insert into wins (user_id = auth.uid())
4) Implement feed -> select wins orde