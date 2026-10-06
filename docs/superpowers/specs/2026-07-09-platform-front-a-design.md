# Platform Frontend Plan A Design

## Goal

Implement the frontend skeleton for the Shan Jinzi education platform across the existing Vue apps, using only `shanjinzi-frontend` and leaving backend code untouched.

## Scope

- `apps/web` is the role-based user app for school administrators, teachers, and parents.
- `apps/admin-web` is the super administrator operations console.
- Backend integration is represented through explicit API contract modules and request helpers. Pages can render mock fallback data until backend endpoints are available.

## User App

The user app must support login, registration with student binding, role-aware dashboard navigation, parent student switching, growth archive, activity posting with student association, competition signup and records, forum, news, private messages, school roster management, binding review, teacher class rosters, and profile editing.

## Admin App

The admin app must support operations dashboard, school management, user management, student management, parent binding supervision, simulated school view, page content, news, competition management, audit logs, and async export tasks.

## Data And API

Frontend modules expose the planned endpoint paths, payload shapes, and mock data. Real security, school isolation, audit immutability, export generation, password encryption, and XSS filtering remain backend responsibilities, but the UI labels high-risk actions and routes form submissions through API helper functions.

## Verification

- Contract tests cover user role navigation, parent student context, and super admin endpoints.
- Both Vite apps must build successfully.
- A local dev server check must verify the main user and admin screens render without blank pages.
