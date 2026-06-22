-- ============================================================================
-- Mpumalanga AgriSupport — Seed Data (PostgreSQL)
-- ============================================================================
-- Minimal seed for local development and first deploy.
--
-- IMPORTANT: password_hash values below are PLACEHOLDERS. Generate real
-- bcrypt/argon2 hashes in your API/seed script before using in any shared or
-- production environment. Do NOT ship default credentials to production.
--
-- Apply AFTER schema.sql:  psql "$DATABASE_URL" -f db/seed.sql
-- ============================================================================

BEGIN;

-- Default admin staff account (replace the hash; change password immediately).
-- Mirrors the current client/server default of username "admin".
INSERT INTO staff_users (username, password_hash, name, role)
VALUES ('admin', '$REPLACE_WITH_BCRYPT_HASH', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

COMMIT;
