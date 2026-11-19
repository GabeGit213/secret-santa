# Secret Santa

A mobile-first Secret Santa draw for one fixed school class. Each participant enters a name and 2-3 interests, joins a live waiting room, and taps ready. Supabase PostgreSQL creates every assignment automatically once everyone is ready.

## Supabase setup

1. Create a Supabase project.
2. Open **Authentication → Sign In / Providers** and enable **Allow anonymous sign-ins**.
3. Open the SQL editor. In `supabase/schema.sql`, replace `CHANGE_ME` with a private PIN/passphrase.
4. Paste the complete file into the SQL editor and run it once.
5. Open **Project Settings → API** and copy the **Project URL** and **anon public** key.

Never add the `service_role` key to this project.

## GitHub setup

1. Push this repository to the `main` branch.
2. Open **Settings → Secrets and variables → Actions** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Open **Settings → Pages**, set **Source** to **GitHub Actions**, and enable Pages.
4. Push to `main` or run the Deploy workflow manually.

## Local development

```sh
cp .env.example .env
npm install
npm run dev
```

Fill both Vite environment variables in `.env`.

## Running it for the class

Share the GitHub Pages link. Everyone joins and taps **Sunt gata**. The host chooses the required participant count from the Admin panel.

## Starting over

Tap **Admin** in the top-right corner, enter the PIN, choose the participant limit or tap reset twice.

## Known limits

- Clearing browser data or switching browser loses that person's anonymous identity. Their name will be taken until the host resets the draw.
- Free Supabase projects may pause after about a week of inactivity.
