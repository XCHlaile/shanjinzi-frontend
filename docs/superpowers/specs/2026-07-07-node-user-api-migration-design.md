# Node User API Migration Design

## Goal

Move the public/user-facing API surface from the legacy Node/Express backend into `shanjinzi-backend`, then remove the legacy Node backend so both frontends use Spring as the only backend.

## Scope

Keep the existing root Vue frontend API paths and response shapes working:

- Authentication: `/api/send-code`, `/api/verify-code`, `/api/users/login`, `/api/users/password-login`, `/api/users/register`, `/api/users/update`, `/api/users/change-phone`, `/api/users/account/{id}`.
- Registrations and search: `/api/competitions/register`, `/api/competitions/registrations`, `/api/competitions/registrations/{id}`, `/api/stats`, `/api/search`.
- Community content: `/api/activities`, `/api/activities/{id}/like`, `/api/activities/{id}/comment`, `/api/forum/topics`, `/api/forum/topics/{id}/like`, `/api/forum/topics/{id}/reply`.
- Public content and upload: `/api/news`, `/api/news/{id}`, `/api/upload`.

The migration uses Spring database tables instead of JSON files. Existing legacy JSON import remains the bridge for historical data.

## Architecture

Spring keeps the legacy route names to minimize frontend changes. Controllers use `JdbcTemplate`, matching the current admin controllers and avoiding a broad JPA repository refactor. Responses include legacy top-level keys such as `user`, `activities`, `topics`, `news`, `registrations`, and `success`.

The existing schema already has most migrated tables. Add small child tables for activity comments and forum replies because those records were nested arrays in JSON and must survive the migration. Keep likes as simple counters, matching the old Node behavior.

## Authentication

User password login validates against BCrypt hashes created by the legacy import service and creates the same JWT type used elsewhere. The legacy response still includes the top-level `user` object plus token fields so existing frontend code keeps working. SMS verification is implemented as an in-memory code store for local compatibility; no cloud SMS secret is embedded.

## Frontend Changes

Root frontend already defaults to `http://localhost:8081/api`. Direct relative calls for upload and profile update are changed to use that same API base so they work when Vite runs on port `3001`. Admin frontend keeps using `VITE_ADMIN_API_BASE`, but its default should match Spring on `8081`.

## Deletion

After Spring exposes the migrated routes and frontend calls no longer depend on Express, remove `server.cjs` and the `backend/` Node package. Remove backend-only Express dependencies from the root package manifest.

## Testing

Add Spring MVC integration tests for the legacy API behavior before implementation. Cover login/register, activity comment/like, forum reply, registration/search, upload, and a representative public news response. Then run Maven tests and frontend build.
