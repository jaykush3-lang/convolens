# ConvoLens

AI-powered conversation analysis SaaS built with Next.js 14, Supabase, Anthropic Claude, OpenAI Whisper, React Query, Tailwind CSS, and Framer Motion.

## Run locally on your phone

1. Keep your PC and phone on the same Wi-Fi.
2. In this project folder run:
   npm run dev:network
3. Open this URL on your phone:
   http://10.107.215.182:3001

If it does not open, allow Node.js through Windows Firewall when prompted.

## Required environment variables

Fill these in inside `.env.local`:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase setup

1. Create a new Supabase project.
2. In Supabase Dashboard, go to `Settings > API`.
3. Copy these values into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   `SUPABASE_SERVICE_ROLE_KEY` = service_role secret key
4. Open the SQL editor in Supabase and run `supabase/schema.sql`.
5. Go to `Authentication > Providers` and enable:
   Email
   Google
6. In `Authentication > URL Configuration`, add these redirect URLs:
   `http://localhost:3000/auth/callback`
   `http://127.0.0.1:3000/auth/callback`
   `http://10.107.215.182:3001/auth/callback`
7. If Supabase asks for a site URL, use:
   `http://localhost:3000`
8. For Google OAuth, also add the Google provider credentials inside Supabase.

## Local startup

1. Fill `.env.local`.
2. Restart the Next.js dev server after adding env values.
3. Run one of these:
   `npm run dev`
   `npm run dev:network`

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add all environment variables from `.env.local` in Vercel project settings.
4. In Supabase Auth URL configuration, add your Vercel callback URL:
   `https://YOUR-DOMAIN.vercel.app/auth/callback`
5. Update the site URL to your Vercel domain after deploy.
6. Redeploy.

## Custom domain setup

1. In Vercel, open your project and go to `Settings > Domains`.
2. Add your custom domain, for example `convolens.yourdomain.com`.
3. Follow Vercel's DNS instructions at your domain provider.
4. Once the custom domain is verified, update Supabase `Authentication > URL Configuration`.
5. Set `Site URL` to:
   `https://convolens.yourdomain.com`
6. Add this redirect URL:
   `https://convolens.yourdomain.com/auth/callback`
7. Keep your local and Vercel fallback callback URLs too.
8. Redeploy after the domain is active.

## Branding notes

- Brand asset: `public/convolens-mark.svg`
- Product name: `ConvoLens`
- Current live URL: `https://convolens.vercel.app`
- Recommended next step for a public launch: connect a custom domain before broad sharing

## Build checks

- `npm run lint`
- `npm run build`