-- ============================================================================
-- Mpumalanga AgriSupport — Core Database Schema (PostgreSQL)
-- ============================================================================
-- Target: PostgreSQL 14+ (uses gen_random_uuid from pgcrypto, JSONB, triggers)
--
-- This schema implements the logical data model from the Business Requirements
-- Document (section 8.1) plus the runtime data shapes currently stored in the
-- browser (localStorage) by:
--   - js/auth.js              -> users
--   - js/account-profile.js   -> user_profiles + documents
--   - js/applications.js      -> applications
--   - js/staff-portal.js      -> application_events, issue_reports
--   - js/staff-auth.js        -> staff_users
--   - js/feedback.js          -> feedback
--
-- Files: filenames/bytes are NOT stored in the database. Only metadata +
-- a pointer (storage_key) to the object store (MinIO / Azure Blob / Vercel Blob).
--
-- Apply with:   psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================================

BEGIN;

-- Required extensions ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive text (emails, usernames)

-- ----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on UPDATE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. USERS (applicants)
--    Source: js/auth.js  (farm_users)
--    SA ID is the login identifier. Store a hash of the ID, never plaintext
--    where avoidable; id_number_last4 kept for support/display only.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_number_hash     TEXT NOT NULL UNIQUE,          -- hash of 13-digit SA ID
  id_number_last4    CHAR(4),                        -- for display/support only
  password_hash      TEXT NOT NULL,                  -- bcrypt/argon2 (server-side)
  full_name          TEXT,
  email              CITEXT,
  phone              TEXT,
  physical_address   TEXT,
  two_fa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'suspended', 'deleted')),
  last_login_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 2. USER PROFILES (personal + farm details)
--    Source: js/account-profile.js  (farm_user_profiles)
--    One profile per user. Documents live in the documents table.
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- personal
  full_name          TEXT,
  contact_number     TEXT,
  email              CITEXT,
  physical_address   TEXT,
  -- farm
  farm_name          TEXT,
  district           TEXT,
  coordinates        TEXT,                 -- "lat,lng" free text from the form
  size_ha            NUMERIC(12,2),
  main_commodities   TEXT,
  soil_type          TEXT,
  irrigation_type    TEXT,
  previous_yields    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 3. STAFF USERS (reviewers / administrators)
--    Source: js/staff-auth.js (farm_staff_users) + STAFF_USERS env var
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username           CITEXT NOT NULL UNIQUE,
  password_hash      TEXT NOT NULL,
  name               TEXT NOT NULL,
  role               TEXT NOT NULL DEFAULT 'staff'
                       CHECK (role IN ('staff', 'admin')),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_staff_users_updated_at
  BEFORE UPDATE ON staff_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4. APPLICATIONS (grant submissions: crop / mesp / environmental / livestock)
--    Source: js/applications.js (farm_applications)
--    + workflow fields from js/staff-portal.js
--
--    summary  : small set of headline fields (cropType, farmerCategory, name,
--               sfgSupply, etc.) used by lists/cards.
--    details  : full multi-step form payload from
--               Application/application-shared.js serializeFormDetails().
--               Stored as JSONB so we do not need hundreds of columns.
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code        TEXT UNIQUE,                 -- e.g. "APP-1718000000000"
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                  TEXT NOT NULL
                          CHECK (type IN ('crop', 'mesp_2025_26', 'environmental', 'livestock', 'other')),
  commodity             TEXT,                        -- livestock/MESP commodity
  farmer_category       TEXT
                          CHECK (farmer_category IN ('Subsistence', 'Smallholder', 'Commercial') OR farmer_category IS NULL),
  status                TEXT NOT NULL DEFAULT 'Submitted'
                          CHECK (status IN ('Submitted', 'In Review', 'Docs Required', 'Approved', 'Rejected')),
  summary               JSONB NOT NULL DEFAULT '{}'::jsonb,
  details               JSONB NOT NULL DEFAULT '{}'::jsonb,
  status_message        TEXT,                        -- reviewer documentation request
  stage_evidence_latest TEXT,                        -- latest stage note (denormalised)
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at            TIMESTAMPTZ,
  decided_by            UUID REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user      ON applications (user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status    ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_type      ON applications (type);
CREATE INDEX IF NOT EXISTS idx_applications_summary   ON applications USING GIN (summary);
CREATE INDEX IF NOT EXISTS idx_applications_details   ON applications USING GIN (details);

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 5. APPLICATION EVENTS (workflow / audit trail)
--    Source: stageHistory array in js/staff-portal.js (advanceStage / decisions)
--    Normalised into rows for a proper auditable trail.
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id     UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  actor_staff_id     UUID REFERENCES staff_users(id) ON DELETE SET NULL,
  action             TEXT NOT NULL
                       CHECK (action IN ('submitted', 'stage_advanced', 'docs_requested',
                                         'approved', 'rejected', 'note', 'reopened')),
  from_status        TEXT,
  to_status          TEXT,
  stage              TEXT,                            -- MESP procedure stage label
  note               TEXT,                            -- mandatory evidence/message
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_events_app ON application_events (application_id, created_at);

-- ============================================================================
-- 6. DOCUMENTS (metadata only — bytes live in object/blob storage)
--    Source: file inputs on grant forms + js/account-profile.js documents.
--    storage_key points to MinIO / Azure Blob / Vercel Blob.
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id     UUID REFERENCES applications(id) ON DELETE CASCADE,
  document_type      TEXT NOT NULL
                       CHECK (document_type IN (
                         'id_copy', 'land_proof', 'proof_of_ownership', 'business_plan',
                         'income_proof', 'bank_statement', 'bank_details', 'legal_entity_doc',
                         'brand_certificate', 'eia', 'ais_permit', 'water_licence',
                         'grazing_plan', 'housing_plan', 'biosecurity_plan',
                         'tb_certificate', 'brucellosis_cert', 'vaccination_record',
                         'dipping_record', 'vet_report', 'other')),
  filename           TEXT NOT NULL,
  content_type       TEXT,
  size_bytes         BIGINT,
  storage_key        TEXT NOT NULL,                   -- object key / blob path
  storage_provider   TEXT NOT NULL DEFAULT 'blob'
                       CHECK (storage_provider IN ('blob', 'minio', 'azure', 'local')),
  uploaded_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user        ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application ON documents (application_id);
CREATE INDEX IF NOT EXISTS idx_documents_type        ON documents (document_type);

-- ============================================================================
-- 7. PENDING 2FA (OTP flow)
--    Source: BRD 7.1. Short-lived; clean up expired rows periodically.
-- ============================================================================
CREATE TABLE IF NOT EXISTS pending_2fa (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash          TEXT NOT NULL,                   -- hash of OTP, never plaintext
  phone              TEXT,
  attempts           SMALLINT NOT NULL DEFAULT 0,
  expires_at         TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_2fa_user    ON pending_2fa (user_id);
CREATE INDEX IF NOT EXISTS idx_pending_2fa_expires ON pending_2fa (expires_at);

-- ============================================================================
-- 8. AUTH SESSIONS (optional: server-managed sessions / refresh tokens)
--    Use if you prefer DB-backed sessions over stateless JWT.
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  staff_id           UUID REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash         TEXT NOT NULL UNIQUE,
  user_agent         TEXT,
  ip_address         INET,
  expires_at         TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR staff_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_staff   ON sessions (staff_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- ============================================================================
-- 9. ISSUE REPORTS (support tickets)
--    Source: js/staff-portal.js (farm_issue_reports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS issue_reports (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  issue_type         TEXT NOT NULL,
  description        TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'Submitted'
                       CHECK (status IN ('Submitted', 'In Progress', 'Resolved')),
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_updated_at  TIMESTAMPTZ,
  updated_by         UUID REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports (status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_user   ON issue_reports (user_id);

-- ============================================================================
-- 10. FEEDBACK (site feedback)
--     Source: js/feedback.js (mpu_feedback_entries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  rating             SMALLINT CHECK (rating BETWEEN 1 AND 5),
  message            TEXT,
  page_path          TEXT,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_submitted ON feedback (submitted_at);

COMMIT;
