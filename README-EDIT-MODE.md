# BULLSHIT PROJECT — Simple Edit Mode

This version removes admin/moderator/editor appointments. There is one private owner login. After signing in, hold a Survivor or Killer card on mobile (or right-click on desktop) to edit its profile, change its portrait URL, or remove it. Changes are stored in Supabase and shared with all visitors.

## Setup

1. Create a Supabase project at https://supabase.com/dashboard.
2. In Project Settings → API, copy the Project URL and the public anon/publishable key.
3. Put those two values in `supabase-config.js`. Never use the service_role/secret key.
4. In Supabase SQL Editor, run all of `supabase-setup.sql`.
5. In Supabase Authentication settings, turn OFF public sign-ups.
6. In Authentication → Users, manually create one owner account using your email and a strong password. Do not create accounts for other people if you want to be the only editor.
7. Run all of `supabase-seed.sql` in SQL Editor to import the original 30 Survivors and 27 Killers.
8. Upload the entire folder to your GitHub repository and publish with GitHub Pages.
9. Open your website, tap UNLOCK EDIT MODE, and sign in using the owner account email and password.

## Security note
The password is not hard-coded into the website. Supabase Auth checks it. The browser contains only the public anon key; database Row Level Security permits changes only to signed-in users. Disable public sign-ups and create only your own account. Anyone you share the owner login with can also edit the website, so keep it private.

## Notes
- Public visitors can view the character directory but cannot edit it.
- The original `characters.js` remains as a backup.
- Portraits are currently changed by entering a public image URL, not by uploading an image file.
- Keep a backup of the Supabase table before bulk changes.
