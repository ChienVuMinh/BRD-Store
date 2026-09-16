# BRD Store Backend

Spring Boot backend for the App Store distribution & moderation platform described in `BRD_Store.md`.

## Stack

- Java 17, Spring Boot 3.3, Maven
- PostgreSQL 16 (via Docker Compose)
- Spring Security + JWT (stateless)
- Flyway migrations
- springdoc-openapi (Swagger UI)
- Local disk file storage under `uploads/`

## Running locally

1. Start Postgres:
   ```
   docker compose up -d
   ```
   This creates database `brd_store` with user/password `brd_store` / `brd_store` on port 5432.

2. Run the app (Maven wrapper is included, no local Maven install required):
   ```
   ./mvnw spring-boot:run
   ```
   On Windows PowerShell: `.\mvnw.cmd spring-boot:run`

   Flyway runs automatically on startup and creates the schema + seed data.

3. Open Swagger UI: http://localhost:8080/swagger-ui.html

## Seed credentials

All seed users share the password `Admin@123`.

| Username    | Role               |
|-------------|--------------------|
| sadmin      | S_ADMIN            |
| oadmin      | O_ADMIN            |
| opartner    | O_PARTNER_MANAGER  |
| oreviewer   | O_REVIEWER         |

Login: `POST /api/auth/login` with `{"username": "...", "password": "Admin@123"}` returns a JWT to use as `Authorization: Bearer <token>`.

Consumers use a separate, simpler auth flow:
- `POST /api/auth/consumer/register`
- `POST /api/auth/consumer/login`

## Core flows implemented

- **Partner lifecycle**: `POST /api/partners/register` (creates partner + INACTIVE P_ADMIN user) -> `POST /api/partners/{id}/approve|reject|suspend` (O_PARTNER_MANAGER/O_ADMIN/S_ADMIN). Approval activates the P_ADMIN account.
- **Partner sub-accounts & API keys**: `POST /api/partners/{id}/users` (P_ADMIN creates P_DEVELOPER/P_QC/P_FINANCE), `POST /api/partners/{id}/api-keys`.
- **App metadata**: `POST /api/partners/{partnerId}/apps`, update, category/geography/tag/permission mapping, logo/banner/screenshot upload, `submit -> approve/reject -> suspend` state machine.
- **App version lifecycle**: `POST /api/apps/{appId}/versions` (multipart upload) -> `submit` -> `send-to-review` -> `review-approve`/`review-reject` (O_REVIEWER) -> `publish` (auto-archives the previously published version).
- **Consumer interactions**: install tracking, 1 review per user per app, developer reply, moderation via `is_hidden` (O_SUPPORT/O_ADMIN/S_ADMIN).
- **Notifications**: persisted table + `GET /api/notifications`, `POST /api/notifications/{id}/read`. Sent asynchronously (`@Async`) on partner/app/version status changes and developer replies.
- **Audit log**: every create/update/delete/status-change/role-change/financial-change writes to `audit_logs` with old/new JSON snapshots, actor, IP. Query via `GET /api/audit-logs` (S_ADMIN/O_SUPPORT only).
- **app_stats aggregation**: `@Scheduled` job (default every 5 minutes, configurable via `app.stats.recalc-interval-ms`) recalculates total_downloads, average_rating, total_reviews per app.

## Judgment calls / gaps vs BRD (please confirm)

1. **App metadata approval role**: BRD doesn't explicitly name who approves `PENDING_APPROVAL -> APPROVED` for app metadata (only version review is explicitly O_REVIEWER). Assumed O_REVIEWER/O_ADMIN/S_ADMIN, mirroring version review.
2. **Consumer auth**: BRD doesn't specify a consumer auth mechanism. Implemented a separate lightweight JWT flow (`account_id` + password) reusing the same `consumers` table, added `password_hash` column (not in original BRD schema) since consumers need to authenticate somehow.
3. **Notifications table**: added per your instructions (not in BRD Part B) with `user_id`/`consumer_id` (nullable, one required) to support both staff and consumer notifications.
4. **Finance/Payout**: explicitly out of scope per your direction — `apps.price_vnd` etc. exist as declared fields only, no transactions/settlements/payouts tables.
5. **Partner API key validation**: key generation/hashing/revocation implemented; did not wire a separate API-key-based auth filter for CI/CD upload endpoints (JWT auth covers all current endpoints) — flagged as a possible follow-up if automated build upload via API key is needed later.
6. **P_QC / P_FINANCE**: roles seeded and assignable via partner user creation, but no QC-specific "report bug" endpoint or P_FINANCE-specific bank-account-update endpoint was built beyond what P_ADMIN/general partner update already covers, since BRD doesn't detail these as separate workflows.
