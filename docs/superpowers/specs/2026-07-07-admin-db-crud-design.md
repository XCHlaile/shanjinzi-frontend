# Admin DB CRUD Design

## Goal

Make the super-admin UI operate on the Spring/MySQL database instead of placeholder actions. Admin create, edit, publish, disable, delete, export, and message actions should persist changes in the existing `shanjinzi_admin` tables.

## Scope

- User management: list, create, edit, enable, disable, delete, reset password, and batch disable on `app_users`.
- School management: list, create, edit, enable, disable, delete on `schools`; block deletion when users still reference the school.
- Page management: list, create, edit Markdown, publish, delete on `page_contents` and create `page_versions` snapshots.
- News management: list, create, edit, publish, unpublish, pin/unpin, delete on `news_articles`.
- Messages: list real conversations and allow creating a service conversation/message.
- Audit logs: list real `audit_logs`.
- Export tasks: list real `export_tasks`; create a completed CSV export task backed by a local file URL.

## Architecture

Use the existing Spring `JdbcTemplate` controller style and `ApiResponse` wrapper. Keep business rules conservative: validate required fields, return HTTP 400 for invalid operations, and use soft delete for users by setting `deleted_at/status` so public user history is preserved.

The admin Vue app continues using Element Plus and `request()` from `apps/admin-web/src/api/client.js`. Each management page gets a compact dialog form and refreshes its table after a successful write.

## Data Rules

- `app_users.phone` and `schools.name` remain unique.
- User delete sets `status='DELETED'` and `deleted_at=now`.
- School delete is a physical delete only when no user references it.
- Page publish sets `status='PUBLISHED'` and `published_at=now`.
- News publish/unpublish toggles `status`; delete physically removes the article.
- Export creates CSV files under `shanjinzi-backend/target/admin-exports` and records `/admin-exports/<file>` in `export_tasks.file_url`.

## Verification

- Add MockMvc tests for admin CRUD endpoints.
- Run full backend Maven tests.
- Build the admin frontend with Vite.
