# Tradolog

Modern SaaS trading journal for recording, reviewing, analyzing, and improving trading performance.

This is **not** a trading platform and does **not** execute trades.

## Stack

- Astro 7 (SSR) + React islands
- Tailwind CSS v4 + shadcn/ui (NeoGlass)
- PostgreSQL + Drizzle ORM
- Better Auth
- Cloudflare R2 (screenshots — later)
- Deployed on Vercel

## Setup

```sh
npm install
cp .env.example .env
# Fill DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
npm run db:migrate
npm run db:seed
npm run dev
```

Dev server: `http://localhost:4321`

Auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`

Protected area (auth verification only): `/app`

## Database

Migrations live in `drizzle/`:

- `0000_auth_tables.sql` — Better Auth
- `0001_domain_schema.sql` — trading journal domain

Domain tables: `profiles`, `accounts` (trading), `symbols`, `strategies`, `trades`, `trade_images`, `trade_notes`, `trade_reviews`, `monthly_goals`, `watchlists`

Note: Better Auth `account` (OAuth/credentials) is separate from trading `accounts`.

## Auth notes

- Google OAuth appears when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.
- Password reset emails are logged to the server console until an email provider is wired.

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start Astro dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with `astro check` |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed demo catalog data |
| `npm run db:studio` | Open Drizzle Studio |

## Architecture

Feature-based layout under `src/features/*` with shared kernel in `src/shared/*`.

Data access: UI → Service → Repository → Drizzle (no DB logic in components).

## Feature order

1. Authentication
2. Database schema ← current
3. Trading calculator
4. Dashboard layout
5. Trade CRUD
6. Analytics
7. Calendar
8. Goals
9. Notes
10. Settings
11. Optimization
12. Testing
