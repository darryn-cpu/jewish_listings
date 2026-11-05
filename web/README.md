# Jewish Business Directory web app

One Next.js app serves the mobile directory, the six-step application, the Foundation 2000 vetting desk, and `/api/v1` for the Android app. Supabase hosts Postgres and a private Storage bucket named `business-documents`. Applicants do not get accounts. Staff sign in against the `AdminUser` table.

The Android project at the repository root is unchanged and still reads its local listings file.

## Requirements

- Node.js 20 or newer
- npm
- The Supabase CLI and Docker, for local Postgres and Storage

## Local setup

From `web`:

```powershell
copy .env.example .env
npx supabase start
npx supabase status -o env
```

Copy the API URL, database URL, and service role key from that status output into `.env`. `SUPABASE_SERVICE_ROLE_KEY` stays on the server. Do not prefix it with `NEXT_PUBLIC_`.

`supabase/config.toml` creates the private `business-documents` bucket when the local stack starts. On a hosted project, create the same private bucket (10 MB; PDF, JPEG, PNG, and WebP) before accepting uploads. The Data API is locked by the Prisma migration: row level security is enabled and no anonymous policies are added. The Next.js server connects as the database owner through Prisma.

Then apply the schema and seed synagogues, industries, and the first super admin:

```powershell
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The app listens on http://localhost:3000. Set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` (at least 10 characters) before seeding. Sign in at http://localhost:3000/admin.

For a hosted database, point `DATABASE_URL` at the transaction pooler on port 6543 with `?pgbouncer=true`, and point `DIRECT_URL` at the session pooler or direct connection on port 5432. Run `npx prisma migrate deploy` against `DIRECT_URL`.

## Mail and bot checks

Leave `RESEND_API_KEY` empty to print applicant mail in the server log. Set `RESEND_API_KEY` and `MAIL_FROM` to send through Resend.

Leave both Turnstile variables empty for local submissions. In production set `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Production rejects applications that skip the bot check.

## Checks

These do not start the server:

```powershell
npm test
npm run typecheck
```

## API

Public:

- `GET /api/v1/config/metadata`
- `POST /api/v1/uploads/presigned-url`
- `POST /api/v1/applications`
- `GET /api/v1/applications/status/:refCode?token=`
- `GET /api/v1/directory`
- `GET /api/v1/directory/:id`

Staff, with the httpOnly session cookie:

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/queue`
- `GET /api/v1/admin/applications/:id`
- `PATCH /api/v1/admin/applications/:id/status`
- `GET /api/v1/admin/stats`
- `POST /api/v1/admin/users`
