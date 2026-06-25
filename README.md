# CubeComp Notifier

Get instant SMS alerts when new World Cube Association (WCA) competitions are announced near you.

## Features

- **SMS notifications** — Receive a text the moment a new competition is announced
- **Location-based radius** — 25 / 50 / 100 / 250 miles, or worldwide
- **Phone verification** — OTP confirms your number before alerts begin
- **Runs every 15 minutes** — Vercel Cron polls the WCA REST API continuously
- **Zero duplicates** — Notifications table prevents sending the same alert twice
- **Dashboard** — Update your location, radius, pause/resume, or delete your account
- **Admin panel** — Protected stats page with cron health monitoring

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| SMS | Twilio |
| Geocoding | OpenStreetMap Nominatim (free, no key) |
| Competition Data | [WCA REST API](https://github.com/robiningelbrecht/wca-rest-api) |
| Deployment | Vercel |
| Cron | Vercel Cron (`*/15 * * * *`) |

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd CubeCompNotifier
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in your keys (see `.env.example` for descriptions):
- Supabase URL + keys
- Twilio credentials + phone number
- `CRON_SECRET` (random string, e.g. `openssl rand -hex 32`)
- `ADMIN_SECRET` (separate random string for `/admin` access)

### 3. Set up the database

1. Create a [Supabase](https://app.supabase.com) project
2. Open the SQL Editor and run the contents of [`db/schema.sql`](db/schema.sql)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add all environment variables in Project Settings → Environment Variables
4. Deploy

The `vercel.json` file configures the cron job to run every 15 minutes:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-competitions",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

> **Note:** Vercel Cron jobs running faster than daily require a paid plan.

## How the Competition Monitor Works

Every 15 minutes the cron endpoint:

1. Fetches all upcoming competitions from the WCA REST API (`/v1/competitions/{year}.json`)
2. Filters to `start_date >= today && !isCanceled`
3. Compares IDs against the `competitions` table
4. **New competitions** = anything not already in the DB
5. Inserts new competitions, then loops over all verified/active users
6. Computes Haversine distance between user and competition coordinates
7. Sends SMS if `distance <= user.notification_radius`
8. Inserts a row into `notifications` (unique constraint prevents duplicates)
9. Logs the run to `cron_logs` for the admin dashboard

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/register` | POST | Register a new user, send OTP |
| `/api/verify` | POST | Verify OTP, activate account |
| `/api/user` | GET | Fetch user profile |
| `/api/user` | POST | Send login OTP for dashboard |
| `/api/user` | PATCH | Update user settings |
| `/api/user` | DELETE | Delete account |
| `/api/unsubscribe` | POST | Pause + unverify a user |
| `/api/nearby` | GET | Upcoming competitions near a coordinate |
| `/api/cron/check-competitions` | GET | Run the competition monitor |
| `/api/admin` | GET | Admin stats (requires `x-admin-secret` header) |

## Pages

| Path | Description |
|---|---|
| `/` | Landing page |
| `/register` | Sign-up form with OTP verification |
| `/dashboard` | User settings (login required via OTP) |
| `/admin` | Admin stats dashboard |

## SMS Format

```
🏆 New WCA Competition!

Philadelphia Summer 2026

📍 Philadelphia, PA, US

🗓 Aug 15–16

More info:
https://www.worldcubeassociation.org/competitions/PhillySummer2026
```

## Database Schema

Five tables: `users`, `otp_codes`, `competitions`, `notifications`, `cron_logs`.

See [`db/schema.sql`](db/schema.sql) for the full schema with indexes and RLS policies.

## Limitations

- The WCA REST API is updated **once per day** from the official WCA export. Checking every 15 minutes is the fastest possible detection cadence with this API.
- Competition registration open/close dates are not available in this API; only start/end dates are included in SMS notifications.
- The Nominatim geocoding API has a rate limit of ~1 req/sec. This is fine for registration flow but should not be used for bulk operations.

## License

MIT
