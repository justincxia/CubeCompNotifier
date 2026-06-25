-- CubeComp Notifier - Supabase Database Schema
-- Run this in the Supabase SQL editor to initialize the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number        TEXT        UNIQUE NOT NULL,
  city                TEXT        NOT NULL,
  state               TEXT,
  country             TEXT        NOT NULL,
  latitude            DECIMAL(10, 8) NOT NULL,
  longitude           DECIMAL(11, 8) NOT NULL,
  notification_radius INTEGER     NOT NULL DEFAULT 100,  -- miles; -1 = unlimited
  is_verified         BOOLEAN     NOT NULL DEFAULT FALSE,
  is_paused           BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- OTP verification codes (TTL: 10 minutes)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT        NOT NULL,
  code        TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- Competitions (discovered from WCA REST API)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitions (
  id          TEXT        PRIMARY KEY,  -- WCA competition ID
  name        TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  country     TEXT        NOT NULL,
  latitude    DECIMAL(10, 8),
  longitude   DECIMAL(11, 8),
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  events      TEXT[]      NOT NULL DEFAULT '{}',
  information TEXT,
  website_url TEXT,
  is_canceled BOOLEAN     NOT NULL DEFAULT FALSE,
  announced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- Notifications (one row = one SMS sent; prevents duplicates)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id  TEXT        NOT NULL REFERENCES competitions(id),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- ─────────────────────────────────────────────────────
-- Cron health logs
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cron_logs (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  competitions_found  INTEGER     NOT NULL DEFAULT 0,
  competitions_new    INTEGER     NOT NULL DEFAULT 0,
  notifications_sent  INTEGER     NOT NULL DEFAULT 0,
  error               TEXT,
  status              TEXT        NOT NULL DEFAULT 'success'
);

-- ─────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_phone       ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_location    ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_active      ON users(is_verified, is_paused);

CREATE INDEX IF NOT EXISTS idx_comps_start_date  ON competitions(start_date);
CREATE INDEX IF NOT EXISTS idx_comps_country     ON competitions(country);
CREATE INDEX IF NOT EXISTS idx_comps_announced   ON competitions(announced_at);

CREATE INDEX IF NOT EXISTS idx_notifs_user       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_comp       ON notifications(competition_id);

CREATE INDEX IF NOT EXISTS idx_otp_phone         ON otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires       ON otp_codes(expires_at);

-- ─────────────────────────────────────────────────────
-- Triggers: auto-update updated_at on users
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_logs      ENABLE ROW LEVEL SECURITY;

-- Service role (server-side) bypasses RLS automatically.
-- Public read access for competitions (for the nearby competitions feature).
CREATE POLICY "competitions_public_read"
  ON competitions FOR SELECT
  USING (true);

-- No public write access — all writes go through the service-role key in API routes.
