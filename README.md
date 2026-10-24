# lytt

A private AI chat website. Next.js on Vercel, Supabase for login and storage, and the `lytt` model running in Ollama on your own machine, reached through a Cloudflare Tunnel locked with Cloudflare Access.

```
browser -> Vercel (Next.js, icn1) -> Supabase (ap-northeast-2)
                  |
                  +-> Cloudflare Access (service token) -> Tunnel -> Ollama
```

The browser never talks to Ollama. Only `/api/chat` on the server does, after checking the session, the request origin and the rate limit.

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see the table below). For local chat, `OLLAMA_URL=http://localhost:11434` works without the tunnel.
3. `ollama create lytt -f Modelfile`
4. `npm run dev` and open http://localhost:3000

`npm run build`, `npm run lint` and `npm run typecheck` must pass before pushing.

## Environment variables

| Name | Where to get it |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://lytt.arlenh7.com` in production, `http://localhost:3000` locally |
| `ALLOWED_ORIGINS` | Comma list of origins allowed to call `/api/chat` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Set by the Vercel Supabase integration. Locally, Supabase > Project Settings > API |
| `OLLAMA_URL` | `https://api.arlenh7.com/ollama` (must reach Ollama's `/api/chat` under it) |
| `OLLAMA_MODEL` | `lytt` |
| `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET` | Cloudflare Zero Trust service token (below) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile widget. Test key `1x00000000000000000000AA` always passes |
| `MESSAGES_ENCRYPTION_KEY` | 32 random bytes, base64: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Use the same value everywhere. Losing or changing it makes stored chats unreadable |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the privacy policy and terms |

Never commit real values. The repo is public.

## One-time setup

### Supabase
1. SQL Editor: run `supabase/migrations/0001_init.sql`.
2. Authentication > URL Configuration: Site URL `https://lytt.arlenh7.com`, redirect URLs `https://lytt.arlenh7.com/**` and `http://localhost:3000/**`.
3. Authentication > Emails > Templates: paste `supabase/templates/confirm.html` into "Confirm signup" and `recovery.html` into "Reset password".
4. Authentication > Attack Protection: enable CAPTCHA, provider Turnstile, paste the Turnstile secret key.
5. Recommended: Authentication > SMTP, connect your own email provider. The built-in sender only allows a few emails per hour. If you do this, name the provider in `app/privacy/page.tsx`.

### Cloudflare
1. Tunnel: route `api.arlenh7.com` to `http://localhost:11434` so that `https://api.arlenh7.com/ollama/api/chat` reaches Ollama's `/api/chat`. If the tunnel cannot strip the `/ollama` prefix, point `OLLAMA_URL` at `https://api.arlenh7.com` instead.
2. Zero Trust > Access > Service Auth > Service Tokens: create a token. Copy the Client ID and Secret into Vercel.
3. Zero Trust > Access > Applications > Add self-hosted: domain `api.arlenh7.com`, path `ollama` (or the whole host). Policy action **Service Auth**, include the token from step 2. Requests without the token now get a 403 from Cloudflare.
4. Turnstile: add a widget for `lytt.arlenh7.com` and `localhost`. Site key goes in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret goes in Supabase (above).

### Vercel
Add every variable above in Project > Settings > Environment Variables, add the domain `lytt.arlenh7.com`, and redeploy. Functions run in `icn1` (Seoul) next to the database, set in `vercel.json`.

## Security notes

- Passwords are hashed by Supabase Auth. Sessions live in HttpOnly, Secure, SameSite=Lax cookies.
- Every page, action and route checks the user on the server. Row level security limits every table to its owner.
- Chat titles and messages are AES-256-GCM encrypted before insert.
- Login, signup, reset, unsubscribe and chat are rate limited in Postgres. Turnstile is checked by Supabase Auth.
- Strict CSP with a per-request nonce, HSTS, frame denial and other headers are set in `proxy.ts` and `next.config.ts`. No production source maps.
- Deleting an account removes the auth user, which cascades to profiles, chats and messages, then purges that user's auth audit log entries and rate limit row.
