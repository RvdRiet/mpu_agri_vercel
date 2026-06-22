# Database Schemas — Mpumalanga AgriSupport

PostgreSQL schemas for moving the app off browser `localStorage` to a real
server-side database. No database needs to exist yet — these files define the
tables you will create later.

## Files

| File | Purpose | Required? |
|------|---------|-----------|
| `schema.sql` | Core tables: users, profiles, staff, applications, events, documents, 2FA, sessions, issues, feedback | **Yes** |
| `analytics.sql` | Optional analytics tables (raw events + monthly rollup) | Optional |
| `seed.sql` | Minimal seed data (default admin staff) | Dev only |

## What maps to what

These schemas implement the **Business Requirements Document §8.1** logical
model and the live data shapes currently in the frontend:

| Table | Replaces (current `localStorage` / store) | Source file |
|-------|--------------------------------------------|-------------|
| `users` | `farm_users` | `js/auth.js` |
| `user_profiles` | `farm_user_profiles` | `js/account-profile.js` |
| `staff_users` | `farm_staff_users` + `STAFF_USERS` env | `js/staff-auth.js` |
| `applications` | `farm_applications` | `js/applications.js` |
| `application_events` | `stageHistory` array | `js/staff-portal.js` |
| `documents` | base64 doc data URLs + form file inputs | `js/account-profile.js`, grant forms |
| `issue_reports` | `farm_issue_reports` | `js/staff-portal.js` |
| `feedback` | `mpu_feedback_entries` | `js/feedback.js` |
| `analytics_*` | monthly JSON / Vercel Blob | `api/lib/analytics-*.js` |

### Design notes

- **Files are not stored in the database.** `documents` holds metadata + a
  `storage_key` pointing to object storage (MinIO / Azure Blob / Vercel Blob).
- **Large form payloads** (`applications.summary` / `applications.details`) are
  `JSONB`, matching the dynamic multi-step forms — no need for hundreds of
  columns. GIN indexes allow querying inside them.
- **Form drafts stay client-side** (`js/autosave.js`) and intentionally have no
  table — the BRD treats drafts as device-local cache.
- `updated_at` is maintained automatically by the `set_updated_at()` trigger.

## Applying the schema (later, once you have a database)

```bash
# 1. Set your connection string
export DATABASE_URL="postgresql://user:pass@host:5432/mpu_agri"

# 2. Core schema (required)
psql "$DATABASE_URL" -f db/schema.sql

# 3. Optional analytics tables
psql "$DATABASE_URL" -f db/analytics.sql

# 4. Dev seed (replace the password hash first!)
psql "$DATABASE_URL" -f db/seed.sql
```

## Requirements

- PostgreSQL **14+** (uses `gen_random_uuid()` from `pgcrypto`, `citext`, `JSONB`).
- Both extensions are created by `schema.sql` if your role has permission;
  otherwise have a superuser run:
  `CREATE EXTENSION pgcrypto; CREATE EXTENSION citext;`

## Security reminders before production

- Replace all placeholder password hashes; hash with bcrypt/argon2 server-side.
- Never expose the database directly to the browser — the API is the only client.
- Keep `DATABASE_URL` and blob credentials in environment variables only.
- Encrypt ID numbers/sensitive data and apply POPIA retention policies.
