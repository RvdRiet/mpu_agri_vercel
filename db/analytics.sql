-- ============================================================================
-- Mpumalanga AgriSupport — Analytics Schema (PostgreSQL) [OPTIONAL]
-- ============================================================================
-- The app currently stores analytics as monthly JSON (api/lib/analytics-store.js
-- -> local disk / Vercel Blob). This schema is OPTIONAL and only needed if you
-- want queryable, server-side analytics in PostgreSQL instead of JSON files.
--
-- Two layers:
--   analytics_events        : append-only raw event log (source of truth)
--   analytics_month_rollup   : pre-aggregated monthly summary (matches the
--                              JSON shape in api/lib/analytics-core.js emptyMonth())
--
-- Apply with:  psql "$DATABASE_URL" -f db/analytics.sql
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Raw event log (append-only). One row per tracked event.
-- Event types mirror api/lib/analytics-core.js applyEvent():
--   page_view, application_submitted, application_status,
--   registration, issue_reported, issue_status, feedback
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type         TEXT NOT NULL,
  occurred_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  month              CHAR(7) NOT NULL,                -- 'YYYY-MM' (matches store)
  session_id         TEXT,
  path               TEXT,
  label              TEXT,
  grant_type         TEXT,
  status             TEXT,
  farmer_category    TEXT,
  rating             SMALLINT,
  payload            JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_month ON analytics_events (month);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type  ON analytics_events (event_type, occurred_at);

-- ----------------------------------------------------------------------------
-- Monthly rollup. One row per month, holding the same aggregate structure the
-- dashboard already consumes (pageViews / applications / registrations /
-- issues / feedback) so the existing staff-insights UI can be fed directly.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_month_rollup (
  month              CHAR(7) PRIMARY KEY,             -- 'YYYY-MM'
  page_views         JSONB NOT NULL DEFAULT '{}'::jsonb,
  applications       JSONB NOT NULL DEFAULT '{}'::jsonb,
  registrations      JSONB NOT NULL DEFAULT '{}'::jsonb,
  issues             JSONB NOT NULL DEFAULT '{}'::jsonb,
  feedback           JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  version            INTEGER NOT NULL DEFAULT 1
);

COMMIT;
