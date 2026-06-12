# PathLIMS — Frontend Completeness Audit

**Date:** 2026-06-12  
**Scope:** Full frontend audit of 176 TSX files + 43 TS files across 38 directory modules  
**Auditor:** Principal Frontend Architect + QA Lead  
**Build Status:** ✅ Passes with zero TypeScript errors (2,271 kB JS / 115 kB CSS)

---

## 1. EXECUTIVE SUMMARY

| Metric | Score (0–10) | Notes |
|--------|:-----------:|-------|
| **Frontend Readiness** | **7.5** | Strong page/module coverage; inconsistent state handling holds it back |
| **UI Completeness** | **8.5** | 109+ routes across 30+ modules; all core LIS workflows present |
| **UX Quality** | **6.5** | Good visual design but inconsistent interaction patterns |
| **Code Quality** | **7.0** | Clean component architecture; manual validation and missing edge cases |
| **Production Readiness** | **6.0** | Mock layer is deep but not API-ready; 3 critical blockers before backend integration |

**Overall: 7.0 / 10** — Strong foundation with well-defined gaps. Needs targeted hardening before production.

### What's Excellent
- 135 page files covering 30+ laboratory workflow modules
- 103 mock service functions with realistic Indian-locale data (~950+ records)
- 27 reusable UI components with solid design system
- Dark mode, responsive sidebar, premium dashboards
- All new pages follow consistent patterns (breadcrumbs, loading/error/empty, try/catch + toasts)

### What Needs Work
- **Critical:** No form validation library (Zod installed but unused); all validation is manual
- **Critical:** No API abstraction layer; services are tightly coupled to mock data
- **Critical:** Role-based access control is UI-only (route guards missing)
- **High:** 11 old pages lack loading/error/empty states entirely
- **High:** 2 shared components not exported from barrel (SampleTimeline, ExecutiveChart)
- **High:** Mock credentials embedded in auth store
- **Medium:** No form library (react-hook-form installed but unused)
- **Medium:** No i18n, no accessibility audit, no E2E tests

---

## 2. MODULE-BY-MODULE REPORT

### 2.1 Authentication

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | N/A |
| Detail Page | ✅ | N/A |
| Create/Register | ✅ | Login, Forgot Password, Reset Password, MFA, Change Password |
| Edit | ✅ | Change Password page |
| Delete | ✅ | Logout action in header |
| Filters | ✅ | N/A |
| Search | ✅ | N/A |
| Sorting | ✅ | N/A |
| Pagination | ✅ | N/A |
| Empty State | ✅ | N/A |
| Loading State | ⚠️ | Button-only spinner; no page skeleton |
| Error State | ⚠️ | Inline error message; no retry mechanism |
| Permissions | ❌ | No role gate; login page accessible to all |

**Issues:**
- Mock credentials embedded directly in `authStore.ts` (`MOCK_USERS` array)
- Login uses synchronous mock; no real API integration point
- No session refresh mechanism (30-second interval check is fragile)
- MFA page exists but mocks the verification (no actual 2FA)

---

### 2.2 Dashboards (6 dashboards)

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | N/A |
| Detail Page | ✅ | N/A |
| Create Page | ✅ | N/A |
| Edit Page | ✅ | N/A |
| Delete Action | ✅ | N/A |
| Bulk Actions | ✅ | N/A |
| Filters | ⚠️ | Per-dashboard only (date/status dropdowns) |
| Search | ⚠️ | In-table search only |
| Sorting | ⚠️ | In-table column sorting |
| Pagination | ⚠️ | In-table pagination only |
| Empty State | ⚠️ | Some have per-section empty states; no page-level empty |
| Loading State | ✅ | All 5 dashboards have skeleton loading |
| Error State | ✅ | All 5 dashboards have error + retry |
| Permissions | ✅ | Role-specific dashboards for 5 user roles |

**Issues:**
- `/dashboard` redirects to `/dashboard/super-admin` regardless of user role
- No role-based dashboard routing (technician could navigate to super-admin dashboard)
- Hardcoded branch IDs (`"BRH001"`, `"BRH002"`) in lab-admin and branch dashboards
- Doctor dashboard uses `Math.random()` for mock data (inconsistent with page reloads)

---

### 2.3 Users

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/users` — DataTable with search, sort, pagination |
| Detail Page | ✅ | `/users/:id` — User profile view |
| Create Page | ✅ | `/users/create` — Form with validation |
| Edit Page | ✅ | `/users/:id/edit` — Form with preloaded data |
| Delete Action | ✅ | Bulk delete support via `BulkActions` |
| Bulk Actions | ✅ | Bulk delete |
| Filters | ⚠️ | Client-side role filter only |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting in DataTable |
| Pagination | ✅ | DataTable pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | Roles defined in navItems but no route guard |

**Issues:**
- No role-based route protection (URL can be manually accessed)
- Create/Edit forms lack Zod validation

---

### 2.4 Roles & Permissions

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/roles` — DataTable |
| Detail Page | ✅ | N/A (all info in list) |
| Create Page | ✅ | Modal-based creation |
| Edit Page | ✅ | Modal-based editing |
| Delete Action | ✅ | With confirmation |
| Bulk Actions | ✅ | N/A |
| Filters | ⚠️ | Client-side search only |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ⚠️ | No pagination on roles list |
| Empty State | ✅ | EmptyState component |
| Loading State | ⚠️ | Loading state only on permission matrix |
| Error State | ⚠️ | Error state only on permission matrix |
| Permissions | ⚠️ | Permission matrix exists but UI-only |

**Issues:**
- Permission matrix is a UI mock; no actual backend enforcement
- Role → route mapping is hardcoded in `sidebar.tsx` per NavItem

---

### 2.5 Patients

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/patients` — DataTable with filters, search, export |
| Detail Page | ✅ | `/patients/:id` — Full medical history, visits |
| Create Page | ✅ | `/patients/create` — Multi-field form |
| Edit Page | ✅ | `/patients/:id/edit` — Preloaded form |
| Delete Action | ✅ | With confirmation dialog |
| Bulk Actions | ✅ | Bulk delete |
| Filters | ✅ | Status, date range, doctor filters |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | NavItem has no role restriction |

**Issues:**
- Create/Edit forms lack Zod validation (manual validation)
- Patient analytics page exists but with placeholder data patterns

---

### 2.6 Doctors

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/doctors` — DataTable with export |
| Detail Page | ✅ | `/doctors/:id` — Profile with stats |
| Create Page | ✅ | `/doctors/create` — Form with commission |
| Edit Page | ✅ | `/doctors/:id/edit` — Preloaded form |
| Delete Action | ✅ | With confirmation |
| Bulk Actions | ✅ | Bulk delete |
| Filters | ⚠️ | Client-side specialty filter |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- Referral tracking page exists but uses `Math.random()` for chart data

---

### 2.7 Branches

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/branches` — Card grid with stats |
| Detail Page | ✅ | `/branches/:id` — Full branch profile |
| Create Page | ✅ | `/branches/create` — Form with validation |
| Edit Page | ✅ | `/branches/:id/edit` — Preloaded form |
| Delete Action | ✅ | With confirmation dialog |
| Bulk Actions | ❌ | No bulk operations |
| Filters | ⚠️ | City filter via Select |
| Search | ✅ | Debounced search |
| Sorting | ❌ | No sort on cards (not a table) |
| Pagination | ❌ | No pagination (6 branches, fits page) |
| Empty State | ✅ | EmptyState in list |
| Loading State | ✅ | Card skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ✅ | NavItem restricts to super_admin/lab_admin |

**Issues:**
- Branch details page is synchronous (no async loading, no loading state)
- Branch performance page exists but uses mock data only

---

### 2.8 Test Catalog

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/tests` — DataTable with categories |
| Detail Page | ❌ | No individual test detail page |
| Create Page | ✅ | Modal-based creation |
| Edit Page | ✅ | Modal-based editing |
| Delete Action | ✅ | With confirmation |
| Bulk Actions | ❌ | No bulk operations |
| Filters | ✅ | Category filter tabs |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ⚠️ | DataTable pagination |
| Empty State | ✅ | EmptyState per category |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- No individual test detail page (all actions are modal-based)
- Test packages page is basic CRUD without workflow integration

---

### 2.9 Bookings (Sample Registration)

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/bookings` — DataTable with status filters |
| Detail Page | ❌ | No booking detail view |
| Create Page | ✅ | `/bookings/walk-in` — Multi-step registration |
| Edit Page | ❌ | No edit booking |
| Delete Action | ❌ | No delete/cancel action |
| Bulk Actions | ❌ | No bulk operations |
| Filters | ✅ | Status, date, type filters |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ⚠️ | DataTable has loading prop |
| Error State | ⚠️ | Service throws but no page-level error state |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- CRITICAL: No booking detail, edit, or delete pages
- Booking history and queue pages exist but are basic

---

### 2.10 Sample Lifecycle (NEW)

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/samples/tracking` — Dashboard with search/filters |
| Detail Page | ✅ | `/samples/:id` — Full lifecycle with timeline |
| Create Page | ✅ | `/samples/register` — Registration form |
| Edit Page | ❌ | No edit registered sample |
| Delete Action | ❌ | No delete (disposal exists as status transition) |
| Bulk Actions | ❌ | No bulk operations |
| Filters | ✅ | Status, date, priority, department filters |
| Search | ✅ | Debounced search |
| Sorting | ⚠️ | Client-side sort only |
| Pagination | ⚠️ | Client-side pagination |
| Empty State | ✅ | Per-tab EmptyState |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- Aliquot management, transfers, retesting are separate pages (could be sub-routes of sample detail)
- No bulk sample operations (e.g., batch receive, batch process)
- Legacy `/sample-collection/*` routes still active (duplicate navigation)

---

### 2.11 Lab Operations

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | Workbench, Workload Dashboard, Department Dashboard |
| Detail Page | ❌ | No individual operation detail |
| Create Page | ❌ | N/A (actions on existing samples) |
| Edit Page | ❌ | N/A |
| Delete Action | ❌ | N/A |
| Bulk Actions | ❌ | No batch process/complete |
| Filters | ⚠️ | Tab-based filtering only |
| Search | ⚠️ | Client-side search |
| Sorting | ❌ | No column sorting |
| Pagination | ❌ | No pagination |
| Empty State | ✅ | Per-tab EmptyState |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- No batch processing actions (select multiple samples → process)
- Legacy `/lab-workflow/*` routes still active alongside `/lab-ops/*`

---

### 2.12 Result Entry

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/results` — Entry interface with filters |
| Detail Page | ✅ | Result verification and validation views |
| Create Page | ✅ | Result entry form with parameters |
| Edit Page | ⚠️ | Amend result (via status transition) |
| Delete Action | ❌ | No result deletion |
| Bulk Actions | ⚠️ | Bulk result entry page exists |
| Filters | ✅ | Status, critical, department filters |
| Search | ✅ | Debounced search |
| Sorting | ⚠️ | Client-side sort |
| Pagination | ⚠️ | Client-side pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- Delta check, reference ranges, abnormal results are separate read-only pages (no edit actions)
- Critical alerts page is read-only (acknowledge only)
- No manual result deletion (audit requirement might be intentional)

---

### 2.13 Pathologist Review

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | Review queue, Approval queue |
| Detail Page | ✅ | Report preview with comments |
| Create Page | ✅ | Add comment |
| Edit Page | ❌ | No edit review |
| Delete Action | ❌ | No delete (compliance requirement may be intentional) |
| Bulk Actions | ❌ | No batch approve/reject |
| Filters | ✅ | Status, priority filters |
| Search | ✅ | Debounced search |
| Sorting | ⚠️ | Client-side sort |
| Pagination | ⚠️ | Client-side pagination |
| Empty State | ✅ | Per-queue EmptyState |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- No batch approval workflow (approve/reject one at a time)
- Approval history, rejected reports, comments are separate pages (could be sub-views)

---

### 2.14 Reports

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/reports` — DataTable with filters |
| Detail Page | ✅ | Report preview, patient summary |
| Create Page | ✅ | Report branding, share center |
| Edit Page | ❌ | No report edit |
| Delete Action | ❌ | No delete |
| Bulk Actions | ❌ | No batch operations |
| Filters | ✅ | Status, date range filters |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ⚠️ | Partial coverage |
| Error State | ⚠️ | Partial coverage |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- AI interpretation page is a UI mock (no actual AI integration)
- QR verification page exists but no actual QR generation/validation
- Report branding page has no save/persist
- PDF preview is a static mock

---

### 2.15 Billing & Finance

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/billing` — Invoices list |
| Detail Page | ✅ | Invoice details (inline in dialog) |
| Create Page | ❌ | No invoice creation page |
| Edit Page | ❌ | No invoice edit |
| Delete Action | ⚠️ | Bulk delete only |
| Bulk Actions | ✅ | Bulk delete |
| Filters | ⚠️ | Status filter |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ⚠️ | Table-level empty message only |
| Loading State | ❌ | No loading state |
| Error State | ❌ | No error state |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- No invoice creation or edit pages
- Financial dashboard exists but is read-only with mock data
- Payments list is synchronous (no async loading)
- No payment gateway integration (all mock)

---

### 2.16 Inventory

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | Dashboard, Reagents list |
| Detail Page | ❌ | No item detail view |
| Create Page | ⚠️ | Reorder modal only |
| Edit Page | ❌ | No edit |
| Delete Action | ⚠️ | Bulk delete on some items |
| Bulk Actions | ⚠️ | Bulk delete |
| Filters | ⚠️ | Category tabs |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ⚠️ | Table-level only |
| Loading State | ❌ | No loading state |
| Error State | ❌ | No error state |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- No inventory item detail view
- Purchase orders page exists but no creation flow
- Stock movement tracking is basic

---

### 2.17 Instruments

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | `/instruments` — DataTable |
| Detail Page | ✅ | `/instruments/:id/config` — Config view |
| Create Page | ✅ | Dialog-based creation |
| Edit Page | ✅ | Dialog-based editing |
| Delete Action | ✅ | Bulk delete support |
| Bulk Actions | ✅ | Bulk delete |
| Filters | ✅ | Status, branch filters |
| Search | ✅ | Debounced search |
| Sorting | ✅ | Column sorting |
| Pagination | ✅ | DataTable pagination |
| Empty State | ✅ | EmptyState component |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- Dashboard, connection status, logs, import, mapping, errors are read-only dashboards
- No instrument maintenance scheduling
- No real ASTM/HL7 integration (all mock)

---

### 2.18 Quality Control

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | QC Dashboard |
| Detail Page | ✅ | Levey-Jennings chart view |
| Create Page | ❌ | No QC record creation |
| Edit Page | ❌ | No edit |
| Delete Action | ❌ | No delete |
| Bulk Actions | ❌ | No batch operations |
| Filters | ✅ | Date range, type filters |
| Search | ⚠️ | Basic search |
| Sorting | ⚠️ | Basic sorting |
| Pagination | ⚠️ | Basic pagination |
| Empty State | ✅ | EmptyState |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- Internal QC page (Levey-Jennings) has hardcoded `/quality-control` route
- No QC schedule or auto-generation of QC events
- Westgard rules page is read-only reference

---

### 2.19 Home Collection

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | Calendar, Route Planner, Agent Assignment |
| Detail Page | ✅ | Visit Timeline |
| Create Page | ❌ | No collection booking creation |
| Edit Page | ❌ | No edit |
| Delete Action | ❌ | No cancel/delete |
| Bulk Actions | ❌ | No batch assignment |
| Filters | ✅ | Date, agent, status filters |
| Search | ✅ | Debounced search |
| Sorting | ⚠️ | Basic sorting |
| Pagination | ⚠️ | Basic pagination |
| Empty State | ✅ | EmptyState |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- GPS tracking page is a UI mock (no real GPS integration)
- Route planner has no map integration (static UI)
- No actual SMS/WhatsApp notifications for collection alerts

---

### 2.20 Executive Dashboards

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | 8 specialized dashboards |
| Detail Page | ✅ | N/A |
| Create Page | ✅ | N/A |
| Edit Page | ✅ | N/A |
| Delete Action | ✅ | N/A |
| Bulk Actions | ✅ | N/A |
| Filters | ⚠️ | Date range on most |
| Search | ⚠️ | Table-level only |
| Sorting | ⚠️ | Table-level only |
| Pagination | ⚠️ | Table-level only |
| Empty State | ⚠️ | Table-level empty message only |
| Loading State | ✅ | Skeleton loading |
| Error State | ✅ | ErrorState with retry |
| Permissions | ⚠️ | No role restriction |

**Issues:**
- All dashboards are read-only (viewing only)
- Data is hardcoded mock (no live aggregation)

---

### 2.21 Settings & Subscription

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | General settings, Departments |
| Detail Page | ❌ | No settings detail views |
| Create Page | ✅ | Department creation |
| Edit Page | ✅ | Settings editing (inline) |
| Delete Action | ✅ | Department deletion |
| Bulk Actions | ❌ | N/A |
| Filters | ❌ | N/A |
| Search | ❌ | N/A |
| Sorting | ❌ | N/A |
| Pagination | ❌ | N/A |
| Empty State | ❌ | No empty state |
| Loading State | ❌ | No page-level loading |
| Error State | ❌ | No error state |
| Permissions | ⚠️ | Subscription restricted to super_admin in nav only |

**Issues:**
- General settings has no async save (local state only)
- Settings sections are limited (no email, SMS, security, branding settings)
- Subscription plans page is mock only (no payment integration)
- Tenant management is read-only

---

### 2.22 Portals (Patient & Doctor)

| Criterion | Status | Details |
|-----------|--------|---------|
| List Page | ✅ | Dashboard views |
| Detail Page | ✅ | Patient reports list |
| Create Page | ❌ | No patient self-registration |
| Edit Page | ❌ | No profile editing |
| Delete Action | ❌ | N/A |
| Bulk Actions | ❌ | N/A |
| Filters | ⚠️ | Basic |
| Search | ⚠️ | Basic |
| Sorting | ❌ | N/A |
| Pagination | ❌ | N/A |
| Empty State | ⚠️ | Basic |
| Loading State | ⚠️ | Partial |
| Error State | ⚠️ | Partial |
| Permissions | ✅ | NavItem restricts to patient/doctor roles |

**Issues:**
- Patient portal is minimal (dashboard + reports list)
- Doctor portal is basic (dashboard only, no referral management)
- No patient login flow (same login page as admin)

---

## 3. CRITICAL ISSUES (BLOCKERS)

*Must be fixed before backend integration*

| # | Issue | Affected Area | Impact |
|---|-------|--------------|--------|
| C1 | **No form validation library** — Zod installed but unused in all 135 pages. All validation is manual, inline, and inconsistent. | Every form page | Data integrity risk; inconsistent user experience |
| C2 | **No API abstraction layer** — All 103 mock services are tightly coupled to in-memory arrays. No axios/fetch wrapper, no interceptors, no error normalization, no request/response types. | Entire app | Every service call must be rewritten for backend integration |
| C3 | **No route guards** — Role-based access is UI-only (sidebar hides links). Any user can navigate to any URL directly. | Auth/security | Critical security gap |
| C4 | **Mock credentials in production code** — `authStore.ts` embeds 7 user accounts with plaintext passwords in a `MOCK_USERS` array. | Auth store | Security vulnerability if this reaches production |
| C5 | **No form library** — `react-hook-form` installed but unused in all pages. All forms are uncontrolled or manually controlled. | Every form page | Poor form UX (no dirty tracking, no async validation, no error focus management) |

---

## 4. HIGH PRIORITY ISSUES

*Affect usability or enterprise quality*

| # | Issue | Affected Area |
|---|-------|--------------|
| H1 | **11 old pages lack loading/error/empty states** — branch-details, invoices-list, login, settings, billing pages operate synchronously with no async states | branch-details, invoices-list, login, general-settings, financial-dashboard, reagents-list, purchase-orders, payments-list, subscription-plans, tenant-management, mobile-apps |
| H2 | **2 shared components not in barrel** — `SampleTimeline` and `ExecutiveChart` exist but are not exported from `src/components/shared/index.ts` | Import consistency |
| H3 | **Duplicate navigation paths** — Legacy routes (`/sample-collection/*`, `/lab-workflow/*`) are still active alongside new routes (`/samples/*`, `/lab-ops/*`) causing confusion | Navigation |
| H4 | **Chart colors broken** — `hsl(var(--chart-X))` wraps oklch values in `hsl()` producing invalid CSS. Recently fixed in dashboard files but other files (ai-features, analytics-bi, internal-qc) still affected. | Charts across app |
| H5 | **Booking module incomplete** — No detail page, no edit, no delete/cancel. CRITICAL gap for lab workflow. | Bookings |
| H6 | **No E2E tests** — Zero Playwright/Cypress tests. No unit tests for components or services. | Quality assurance |
| H7 | **All new pages use `useUIStore().showToast()` but old pages use `useToast()` hook** — Two competing toast APIs cause inconsistent UX. | Toast consistency |
| H8 | **No debounce/throttle utility** — Search inputs implement debounce manually and inconsistently (some use SearchInput, some inline state) | Search UX |

---

## 5. MEDIUM PRIORITY ISSUES

*Polish and consistency issues*

| # | Issue | Affected Area |
|---|-------|--------------|
| M1 | **No i18n** — All strings are hardcoded in English with Indian locale date/currency formatting. No translation support. | Global |
| M2 | **CartesianGrid uses `strokeDasharray="3 3"`** — Hardcoded dash pattern should use CSS variable for theming. | All charts |
| M3 | **`branch-details.tsx` is synchronous** — Directly imports mock data array instead of using async service. Will break when switching to real API. | Branches module |
| M4 | **Pagination states** — DataTable resets to page 1 on every data change with no "go to page" input. | All DataTable instances |
| M5 | **No keyboard navigation** — Dialogs and dropdowns are Radix-based (accessible) but no global keyboard shortcuts for common actions. | Global UX |
| M6 | **LoadingState component limited** — Only `card/table/list/detail` variants. No `skeleton-text`, `skeleton-avatar`, `skeleton-chart` variants. | Loading UX |
| M7 | **No optimistic updates** — All CRUD actions show loading spinners instead of immediate UI updates with rollback. | UX quality |
| M8 | **Table component missing sticky header** — Table headers scroll away on long lists. | DataTable |
| M9 | **Avatar component missing size prop** — Always `h-10 w-10`. Can't render smaller/larger avatars. | Avatar |
| M10 | **Card component missing variant system** — No `elevated`/`outlined`/`flat` variant support. | Card |
| M11 | **ExecutiveChart not in barrel export** — Used by 8 pages but must be imported from component file directly. | Import consistency |
| M12 | **Settings page has no async persistence** — Changes to settings are lost on page refresh. | Settings |

---

## 6. LOW PRIORITY ISSUES

*Nice-to-have enhancements*

| # | Issue | Affected Area |
|---|-------|--------------|
| L1 | **No E2E tests**, no component tests, no visual regression tests | QA |
| L2 | **Bundle size 2,271 kB JS** — No code splitting on routes (dynamic `import()` is ineffective due to mixed static imports). | Performance |
| L3 | **Ineffective dynamic imports** — Vite warns that `src/mock/services/index.ts` is both statically and dynamically imported, preventing chunk splitting. | Performance |
| L4 | **No skeleton-chart variant** — Chart areas show spinner instead of chart-shaped skeleton. | Loading UX |
| L5 | **No print styles** — Report preview and invoice pages have no print-specific CSS. | Reports |
| L6 | **No drag-and-drop** — Kanban board is a visual mock with no actual drag-and-drop. | Premium UX |
| L7 | **Tooltip component defined but never used** — `TooltipProvider` at root but `TooltipTrigger`/`TooltipContent` never appear in any page. | Dead code |
| L8 | **No data export beyond CSV** — ExportButton has an "Export Excel" action that is never wired. | Data export |
| L9 | **No colorblind-friendly palette** — Charts rely on hue-only differentiation (oklch hue values 278, 200, 155, 85, 25). | Accessibility |
| L10 | **No keyboard shortcut for theme toggle** — Dark/light switch requires mouse click. | UX polish |

---

## 7. RECOMMENDED FIX PLAN

### Sprint 1: Blockers (Critical)
| # | Task | Est. Effort |
|---|------|-------------|
| 1 | Install and integrate `react-hook-form` + Zod resolvers across all forms | 2-3 days |
| 2 | Create API abstraction layer (`src/lib/api.ts` with axios/fetch wrapper, interceptors, error types) | 1-2 days |
| 3 | Implement route guards (`src/components/auth/ProtectedRoute.tsx` with role checking) | 1 day |
| 4 | Remove `MOCK_USERS` from authStore; move to mock data file | 0.5 day |

### Sprint 2: High Priority
| # | Task | Est. Effort |
|---|------|-------------|
| 5 | Add loading/error/empty states to 11 legacy pages | 2-3 days |
| 6 | Export SampleTimeline and ExecutiveChart from barrel index | 0.5 day |
| 7 | Consolidate legacy routes (redirect `/sample-collection/*` → `/samples/*`) | 0.5 day |
| 8 | Fix remaining `hsl(var(--X))` chart color bugs across all page files | 0.5 day |
| 9 | Build booking detail/edit/cancel pages | 2 days |
| 10 | Set up Playwright or Vitest testing framework; write critical path tests | 2-3 days |
| 11 | Unify toast API (choose one: `useToast()` or `useUIStore().showToast()`) | 0.5 day |
| 12 | Add debounce utility to `src/lib/utils.ts` | 0.5 day |

### Sprint 3: Medium Priority
| # | Task | Est. Effort |
|---|------|-------------|
| 13 | Run `formatDate` and `formatCurrency` through locale detection (begin i18n groundwork) | 1 day |
| 14 | Add sticky header support to DataTable | 0.5 day |
| 15 | Add `size` prop to Avatar component | 0.5 day |
| 16 | Add variant system (CVA) to Card component | 0.5 day |
| 17 | Add skeleton-chart variant to LoadingState | 0.5 day |
| 18 | Convert `branch-details.tsx` to use async service pattern | 1 day |
| 19 | Add "go to page" input to DataTable pagination | 0.5 day |

### Sprint 4: Polish
| # | Task | Est. Effort |
|---|------|-------------|
| 20 | Configure code-splitting for route-level chunks | 1 day |
| 21 | Add print styles for reports/invoices | 1 day |
| 22 | Implement drag-and-drop for kanban board | 2 days |
| 23 | Add colorblind-friendly chart palette option | 1 day |
| 24 | Remove unused Tooltip component or actually wire it into the UI | 0.5 day |
| 25 | Wire ExportButton Excel action | 0.5 day |

**Total estimated effort:** ~20-25 developer-days for production readiness.

---

## 8. APPENDIX: File Counts

| Category | Count |
|----------|-------|
| Page files (`.tsx` in `src/pages/`) | 135 |
| Component files (`.tsx` in `src/components/`) | 41 |
| Store files | 3 |
| Hook files | 2 |
| Type definition files | 1 |
| Utility files | 1 |
| Mock data files | 34 |
| Mock service files | 1 |
| CSS/Config files | 3 |
| **Total TSX/TS files** | **219** |

| Module | Pages | Notes |
|--------|:-----:|-------|
| Authentication | 5 | Login, Forgot/Reset Password, MFA, Change Password |
| Dashboards | 6 | Super Admin, Lab Admin, Branch, Technician, Doctor |
| Users | 4 | List, Create, Edit, Details |
| Roles | 2 | List, Permission Matrix |
| Patients | 5 | List, Create, Edit, Details, Analytics |
| Doctors | 5 | List, Create, Edit, Profile, Referral Tracking |
| Branches | 5 | List, Create, Edit, Details, Performance |
| Test Catalog | 3 | Tests, Categories, Packages |
| Bookings | 4 | List, Walk-In, History, Queue |
| Sample Lifecycle | 9 | Register, Tracking, Details, Collection, Receiving, Aliquots, Transfers, Retesting, Disposal |
| Lab Workflow (legacy) | 4 | Receiving, Accessioning, Processing, Rejected |
| Lab Operations | 3 | Workbench, Workload, Department |
| Results | 8 | Entry, Bulk, Verification, Validation, Delta, Ranges, Abnormal, Alerts |
| Pathologist | 6 | Review, Approval, Preview, History, Rejected, Comments |
| Reports | 8 | List, Approval, PDF, Branding, QR, Summary, AI, Share |
| Instruments | 8 | List, Config, Dashboard, Connection, Logs, Import, Mapping, Errors |
| Quality Control | 7 | QC, Dashboard, Calibration, Maintenance, Alerts, Levey-Jennings, Westgard |
| Billing | 3 | Invoices, Payments, Financial Dashboard |
| Inventory | 3 | Dashboard, Reagents, Purchase Orders |
| Corporate | 2 | Accounts, Contracts |
| Home Collection | 7 | Home, Calendar, Routes, Agents, GPS, Visits, Success |
| Executive | 8 | Revenue, TAT, Volume, Referrals, Branches, Inventory, Payments, Reports |
| Premium UX | 5 | Kanban, Split View, Filters, Actions, Panel |
| CRM | 1 | Campaign Dashboard |
| Notifications | 1 | Notification Center |
| Analytics | 1 | Analytics & BI |
| Audit | 1 | Audit Logs |
| Settings | 2 | General, Departments |
| Subscription | 2 | Plans, Tenants |
| Patient Portal | 2 | Dashboard, Reports |
| Doctor Portal | 1 | Dashboard |
| Mobile Apps | 1 | Mobile Apps |
| AI Features | 1 | AI Features |
| Not Found | 1 | 404 Page |
