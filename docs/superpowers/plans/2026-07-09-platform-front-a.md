# Platform Frontend Plan A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete frontend skeleton for the four-role education platform without changing backend code.

**Architecture:** Keep the existing Vue 3 + Vite workspace. Add explicit contract/mock modules, then wire role-based pages in `apps/web` and super-admin pages in `apps/admin-web`.

**Tech Stack:** Vue 3, Vue Router, Element Plus, Vite, Node built-in test runner.

---

### Task 1: Contract Tests

**Files:**
- Create: `apps/web/src/stores/platformModel.test.js`
- Create: `apps/admin-web/src/api/adminContracts.test.js`
- Modify: `package.json`

- [ ] Add tests for user role navigation, parent student context, and admin endpoint coverage.
- [ ] Run `pnpm test` and confirm the tests fail because the modules do not exist yet.

### Task 2: Contract And Mock Data Modules

**Files:**
- Create: `apps/web/src/stores/platformModel.js`
- Create: `apps/admin-web/src/api/adminContracts.js`
- Modify: `apps/admin-web/src/api/client.js`

- [ ] Implement role labels, role navigation, student context helpers, user app contracts, admin endpoint contracts, admin mock data, and safe request fallbacks.
- [ ] Run `pnpm test` and confirm contract tests pass.

### Task 3: User App Navigation And Pages

**Files:**
- Modify: `apps/web/src/router/index.js`
- Modify: `apps/web/src/components/Navbar.vue`
- Modify: `apps/web/src/views/Dashboard.vue`
- Modify: `apps/web/src/views/Register.vue`
- Modify: `apps/web/src/views/ChildrenActivities.vue`
- Modify: `apps/web/src/views/CompetitionZone.vue`
- Modify: `apps/web/src/views/MessageCenter.vue`
- Create: `apps/web/src/views/StudentSwitcher.vue`
- Create: `apps/web/src/views/GrowthArchive.vue`
- Create: `apps/web/src/views/ClassRoster.vue`
- Create: `apps/web/src/views/SchoolRoster.vue`
- Create: `apps/web/src/views/BindingReview.vue`
- Create: `apps/web/src/views/Profile.vue`

- [ ] Add role-aware user workflows and student-centered growth archive screens.
- [ ] Preserve public pages.

### Task 4: Super Admin App

**Files:**
- Modify: `apps/admin-web/src/router/index.js`
- Modify: `apps/admin-web/src/views/AdminLayout.vue`
- Modify: `apps/admin-web/src/views/Dashboard.vue`
- Create: `apps/admin-web/src/views/Students.vue`
- Create: `apps/admin-web/src/views/Bindings.vue`
- Create: `apps/admin-web/src/views/Simulations.vue`
- Create: `apps/admin-web/src/views/Competitions.vue`

- [ ] Add sidebar routes and list/detail skeletons for the missing super-admin requirements.
- [ ] Fix visible mojibake in the admin shell and client helper messages.

### Task 5: Verify

- [ ] Run `pnpm test`.
- [ ] Run `pnpm run build`.
- [ ] Start the user dev server and inspect key pages in the browser.
- [ ] Start the admin dev server and inspect key pages in the browser.
