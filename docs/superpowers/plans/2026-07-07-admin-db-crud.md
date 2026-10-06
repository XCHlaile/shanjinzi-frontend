# Admin DB CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Spring-backed super-admin UI perform real database writes for users, schools, pages, news, messages, audit logs, and export tasks.

**Architecture:** Keep the existing `JdbcTemplate` controller pattern and `ApiResponse` wrapper. Add focused controller tests first, then implement endpoints, then wire Element Plus dialogs in the admin frontend.

**Tech Stack:** Spring Boot 3.3, JdbcTemplate, MockMvc, MySQL/H2, Vue 3, Element Plus, Vite.

---

### Task 1: Backend Admin CRUD Tests

**Files:**
- Create: `shanjinzi-backend/src/test/java/com/shanjinzi/admin/adminapi/AdminDbCrudControllerTest.java`

- [ ] Write MockMvc tests for user create/update/disable/delete/reset, school create/update/delete guard, page create/update/publish/delete, news create/update/publish/delete, service message creation, audit listing, and export creation.
- [ ] Run `mvn -Dtest=AdminDbCrudControllerTest test` and confirm it fails because endpoints are not implemented.

### Task 2: Backend Admin CRUD Implementation

**Files:**
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/users/AdminUsersController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/schools/AdminSchoolsController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/content/AdminPagesController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/news/AdminNewsController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/messages/AdminMessagesController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/audit/AdminAuditLogController.java`
- Modify: `shanjinzi-backend/src/main/java/com/shanjinzi/admin/export/AdminExportController.java`
- Create if needed: small helper methods inside those controllers.

- [ ] Implement minimal SQL-backed endpoints to make the new tests pass.
- [ ] Run `mvn -Dtest=AdminDbCrudControllerTest test` and confirm it passes.

### Task 3: Admin Frontend Wiring

**Files:**
- Modify: `apps/admin-web/src/views/Users.vue`
- Modify: `apps/admin-web/src/views/Schools.vue`
- Modify: `apps/admin-web/src/views/Pages.vue`
- Modify: `apps/admin-web/src/views/News.vue`
- Modify: `apps/admin-web/src/views/Messages.vue`
- Modify: `apps/admin-web/src/views/ExportTasks.vue`
- Modify if needed: `apps/admin-web/src/views/AuditLogs.vue`

- [ ] Add dialog forms and button handlers for create/edit/delete/status actions.
- [ ] Use `request()` for all database-backed actions.
- [ ] Refresh rows after writes and show Element Plus success/error messages.

### Task 4: Verification

**Files:**
- No production edits expected.

- [ ] Run full backend tests: `mvn test`.
- [ ] Run admin frontend build: `admin-web/node_modules/.bin/vite.cmd build`.
- [ ] Scan for placeholder admin button handlers that still do nothing.
