# Node User API Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the legacy Node user API into Spring and delete the Node backend.

**Architecture:** Add compatible Spring MVC controllers backed by existing SQL tables, with two small child tables for comments/replies. Keep legacy response keys so the Vue frontend needs only URL cleanup.

**Tech Stack:** Spring Boot 3.3, Java 21, JdbcTemplate, Flyway, MockMvc, Vue 3, Vite.

---

### Task 1: Legacy User API Tests

**Files:**
- Create: `shanjinzi-backend/src/test/java/com/shanjinzi/admin/publicapi/LegacyUserApiControllerTest.java`
- Modify: none

- [ ] Write a MockMvc integration test using H2 and Flyway that calls the old Node-compatible API routes.
- [ ] Verify the test fails because the controllers/tables are missing.

### Task 2: Spring Schema and Import Support

**Files:**
- Create: `shanjinzi-backend/src/main/resources/db/migration/V2__public_api_comments.sql`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/migration/LegacyDataImportService.java`

- [ ] Add `activity_comments` and `forum_replies` tables.
- [ ] Extend legacy import to persist nested activity comments and forum replies.
- [ ] Run migration/import tests.

### Task 3: Spring Public/User Controllers

**Files:**
- Create: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/publicapi/LegacyUserApiController.java`
- Create: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/publicapi/LegacyContentApiController.java`
- Create: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/publicapi/UploadController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/security/SecurityConfig.java`
- Modify: `shanjinzi-backend/src/main/resources/application.yml`

- [ ] Implement auth/user, competition/search/stats, activities, forum, news mutation, and upload routes.
- [ ] Permit legacy public routes in Spring Security.
- [ ] Add configurable upload directory.
- [ ] Run the failing tests and make them pass.

### Task 4: Frontend URL Cleanup and Node Removal

**Files:**
- Modify: `src/views/ChildrenActivities.vue`
- Modify: `src/views/Dashboard.vue`
- Modify: `apps/admin-web/src/api/client.js`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Delete: `server.cjs`
- Delete: `backend/package.json`

- [ ] Replace direct `/api/...` browser calls with `API_BASE`.
- [ ] Point admin frontend default API base at Spring `8081`.
- [ ] Remove Express-only dependencies and legacy backend files.
- [ ] Run frontend build.

### Task 5: Verification

**Files:**
- Read: all modified files

- [ ] Run `mvn test` in `shanjinzi-backend`.
- [ ] Run `pnpm install --lockfile-only` if package metadata changed.
- [ ] Run `pnpm run build`.
- [ ] Confirm no remaining references require `server.cjs` or `backend/`.
