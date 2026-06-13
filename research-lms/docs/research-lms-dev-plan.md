# Research LMS — Development Plan

**Technology Stack:** .NET Core 9 (Backend) · MS SQL Server 2022 (Database) · React 19 + TypeScript (Frontend)  
**Project Folder:** `research-lms/` (new, sibling to `lims-frontend/`)  
**Date:** 2026-06-13  
**Version:** 1.0

---

## Table of Contents

1. [Tech Stack Summary](#1-tech-stack-summary)
2. [Project Structure](#2-project-structure)
3. [Phase Overview](#3-phase-overview)
4. [Phase 1 — Foundation & Identity (Weeks 1-5)](#4-phase-1--foundation--identity-weeks-1-5)
5. [Phase 2 — Facility & Equipment Management (Weeks 5-9)](#5-phase-2--facility--equipment-management-weeks-5-9)
6. [Phase 3 — Booking & Scheduling (Weeks 8-12)](#6-phase-3--booking--scheduling-weeks-8-12)
7. [Phase 4 — Workflows & Service Requests (Weeks 11-15)](#7-phase-4--workflows--service-requests-weeks-11-15)
8. [Phase 5 — Financial & Compliance (Weeks 14-18)](#8-phase-5--financial--compliance-weeks-14-18)
9. [Phase 6 — Analytics & BI (Weeks 17-21)](#9-phase-6--analytics--bi-weeks-17-21)
10. [Phase 7 — Communication, Training & Notifications (Weeks 20-24)](#10-phase-7--communication-training--notifications-weeks-20-24)
11. [Phase 8 — AI Modules M1-M4 (Weeks 23-28)](#11-phase-8--ai-modules-m1-m4-weeks-23-28)
12. [Phase 9 — AI Modules M5-M7 + Mobile (Weeks 27-32)](#12-phase-9--ai-modules-m5-m7--mobile-weeks-27-32)
13. [Backend Architecture Patterns](#13-backend-architecture-patterns)
14. [Folder Structure Reference](#14-folder-structure-reference)

---

## 1. Tech Stack Summary

### Backend (.NET Core 9)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | .NET 9 (ASP.NET Core) | Web API framework |
| ORM | Entity Framework Core 9 | Database access |
| Database | MS SQL Server 2022 | Primary relational DB |
| Caching | Redis 7 (Docker) | Session, rate limiting, distributed cache |
| Message Queue | RabbitMQ | Event bus, async processing |
| Search | Elasticsearch 8 (Docker) | Full-text search across assets, users |
| File Storage | Azure Blob Storage / MinIO | SOPs, attachments, reports |
| Real-Time | SignalR | Live dashboards, notifications, chat |
| Auth | JWT + IdentityServer / Entra ID OIDC | Authentication |
| API Docs | Swagger / OpenAPI 3.1 | API documentation |
| Validation | FluentValidation | Request validation |
| Mapping | AutoMapper / Mapster | DTO mapping |
| Logging | Serilog + Seq / ELK | Structured logging |
| Background Jobs | Hangfire | Scheduled tasks, email delivery |
| Testing | xUnit + Moq + Testcontainers | Unit + integration tests |
| Container | Docker + Docker Compose | Local dev environment |
| CI/CD | GitHub Actions | Build, test, deploy |

### Frontend (React 19 — Same Stack)

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Routing | react-router-dom 7 |
| UI | ShadCN UI (Radix primitives) + Tailwind CSS 4 |
| Forms | react-hook-form 7 + Zod 4 |
| State | Zustand 5 + TanStack Query 5 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| HTTP | Axios (generated OpenAPI client) |
| i18n | i18next |
| Testing | Vitest + Playwright |

### Database (MS SQL Server 2022)

- **Primary DB:** All transactional data
- **Time-Series:** SQL Server temporal tables or InfluxDB (Docker) for IoT
- **Full-Text Search:** SQL Server Full-Text Search or Elasticsearch
- **CDC (Change Data Capture):** For event bus integration

---

## 2. Project Structure

```
E:\LIMS\
├── lims-frontend/                        # EXISTING — Pathology LIMS (unchanged)
│   └── ...
│
└── research-lms/                         # NEW — Research LMS
    ├── frontend/                         # React SPA
    │   ├── public/
    │   ├── src/
    │   │   ├── modules/                  # Feature modules (one per domain)
    │   │   │   ├── auth/
    │   │   │   ├── dashboard/
    │   │   │   ├── facility/
    │   │   │   ├── scheduler/
    │   │   │   ├── requests/
    │   │   │   ├── workflow/
    │   │   │   ├── inventory/
    │   │   │   ├── projects/
    │   │   │   ├── issues/
    │   │   │   ├── billing/
    │   │   │   ├── compliance/
    │   │   │   ├── analytics/
    │   │   │   ├── training/
    │   │   │   ├── notifications/
    │   │   │   ├── help/
    │   │   │   ├── ai-modules/
    │   │   │   ├── portals/
    │   │   │   ├── settings/
    │   │   │   └── subscription/
    │   │   ├── shared/                   # Reused from lims-frontend
    │   │   │   ├── ui/                   #   ShadCN components (copy)
    │   │   │   ├── forms/                #   Form components (copy)
    │   │   │   └── layouts/              #   AppLayout, Sidebar, Header (adapt)
    │   │   ├── lib/                      # API client, utils, helpers
    │   │   ├── store/                    # Zustand stores
    │   │   ├── hooks/                    # Custom hooks
    │   │   └── types/                    # TypeScript interfaces
    │   ├── index.html
    │   ├── vite.config.ts
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── backend/                          # .NET Core 9 solution
    │   ├── ResearchLms.sln
    │   │
    │   ├── src/
    │   │   ├── Api/                      # API Gateway / Web Host
    │   │   │   ├── Controllers/          # REST controllers
    │   │   │   ├── Middleware/           # Auth, tenant, error handling
    │   │   │   ├── Hubs/                # SignalR hubs
    │   │   │   ├── Program.cs
    │   │   │   └── appsettings.json
    │   │   │
    │   │   ├── Modules/                  # One project per domain module
    │   │   │   ├── Identity/            # Users, roles, institutions
    │   │   │   ├── Facility/            # Assets, instruments, equipment
    │   │   │   ├── Scheduling/          # Bookings, calendar, availability
    │   │   │   ├── Requests/            # Service requests, forms
    │   │   │   ├── WorkflowEngine/      # Workflow definitions, state machines
    │   │   │   ├── Inventory/           # Supplies, vendors, POs
    │   │   │   ├── Projects/            # Projects, work orders, cost centers
    │   │   │   ├── Issues/              # Issue tracking
    │   │   │   ├── Billing/             # Invoices, pricing, ERP sync
    │   │   │   ├── Compliance/          # Audit logs, e-signatures
    │   │   │   ├── Analytics/           # Dashboards, widgets, reports
    │   │   │   ├── Notifications/       # Email, SMS, Teams, push
    │   │   │   ├── Training/            # Competency, prerequisites
    │   │   │   ├── Help/                # Documentation, walkthroughs
    │   │   │   └── AiServices/          # M1-M7 AI modules
    │   │   │
    │   │   ├── Shared/                  # Shared kernel
    │   │   │   ├── Abstractions/        # Interfaces, base classes
    │   │   │   ├── Domain/              # Domain primitives, value objects
    │   │   │   ├── EventBus/            # RabbitMQ integration
    │   │   │   ├── Storage/             # File storage abstraction
    │   │   │   ├── Search/              # Elasticsearch abstraction
    │   │   │   └── MCP/                 # MCP protocol implementation
    │   │   │
    │   │   └── Migrations/              # EF Core migrations (centralized)
    │   │
    │   ├── tests/
    │   │   ├── UnitTests/
    │   │   ├── IntegrationTests/
    │   │   └── E2ETests/
    │   │
    │   ├── docker/
    │   ├── k8s/
    │   └── Dockerfile
    │
    ├── mobile/
    │   ├── ios/                          # SwiftUI app (Phase 9)
    │   └── android/                      # Jetpack Compose app (Phase 9)
    │
    ├── infrastructure/
    │   ├── terraform/
    │   └── scripts/
    │
    ├── docs/
    │   ├── architecture.md
    │   └── api/
    │
    └── README.md
```

---

## 3. Phase Overview

```
Phase 1: Foundation & Identity          ████████░░░░░░░░░░░░░░░░░░░░░░  Weeks 1-5
Phase 2: Facility & Equipment Mgmt      ░░░░████████░░░░░░░░░░░░░░░░░░  Weeks 5-9
Phase 3: Booking & Scheduling            ░░░░░░████████░░░░░░░░░░░░░░░░  Weeks 8-12
Phase 4: Workflows & Service Requests   ░░░░░░░░████████░░░░░░░░░░░░░░  Weeks 11-15
Phase 5: Financial & Compliance          ░░░░░░░░░░████████░░░░░░░░░░░░  Weeks 14-18
Phase 6: Analytics & BI                  ░░░░░░░░░░░░████████░░░░░░░░░░  Weeks 17-21
Phase 7: Communication & Training        ░░░░░░░░░░░░░░████████░░░░░░░░  Weeks 20-24
Phase 8: AI Modules M1-M4                ░░░░░░░░░░░░░░░░████████░░░░░░  Weeks 23-28
Phase 9: AI Modules M5-M7 + Mobile       ░░░░░░░░░░░░░░░░░░████████░░░░  Weeks 27-32
```

Each phase delivers **fully working modules** — backend API, frontend pages, database schema, tests, and integration.

---

## 4. Phase 1 — Foundation & Identity (Weeks 1-5)

**Goal:** Project scaffolding, database setup, authentication/authorization, user management, multi-institution foundation.

### 4.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 1.1 | Create .NET 9 solution with Clean Architecture structure | `ResearchLms.sln` with projects | 1 |
| 1.2 | Configure EF Core 9 + MS SQL Server 2022 connection | DbContext, connection string, migrations | 1 |
| 1.3 | Set up Serilog logging to file + Seq | Structured logging everywhere | 1 |
| 1.4 | Implement JWT authentication + OIDC Entra ID integration | `AuthController`, JWT middleware, token refresh | 3 |
| 1.5 | Implement multi-tenant middleware (host-based tenant resolution) | Tenant middleware, `ITenantContext` | 2 |
| 1.6 | Build Identity module — User entity, Role entity, EF configuration | `Users` table, `Roles` table, `UserRoles` join | 2 |
| 1.7 | Build Identity module — CRUD API (`/api/users`, `/api/roles`) | Controllers, services, DTOs, FluentValidation | 3 |
| 1.8 | Build Identity module — RBAC permission system | `Permissions` table, role-permission assignment | 2 |
| 1.9 | Build Identity module — ABAC rule engine | `AbacRules` table, policy evaluation service | 3 |
| 1.10 | Build Institution module — multi-institution CRUD | `Institutions` table, controllers | 2 |
| 1.11 | Implement Hangfire for background jobs (email, cleanup) | Hangfire server + dashboard | 1 |
| 1.12 | Set up RabbitMQ + MassTransit for event bus | Event bus abstraction, `UserCreatedEvent` | 2 |
| 1.13 | Set up Elasticsearch + indexing for users | `IUserSearchService`, search indexing | 2 |
| 1.14 | Write integration tests for Identity module | xUnit + Testcontainers | 2 |
| 1.15 | Docker Compose for local dev (SQL Server, Redis, RabbitMQ, ES) | `docker-compose.yml` | 1 |

### 4.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 1.16 | Scaffold Vite + React + TypeScript project | `frontend/` project | 0.5 |
| 1.17 | Copy ShadCN UI components from `lims-frontend` | 27 UI components in `src/shared/ui/` | 1 |
| 1.18 | Copy form components from `lims-frontend` | 11 form components in `src/shared/forms/` | 0.5 |
| 1.19 | Copy + adapt layout system (AppLayout, Sidebar, Header) | `src/shared/layouts/` | 1 |
| 1.20 | Copy utility files (cn, formatDate, formatCurrency) | `src/lib/utils.ts` | 0.5 |
| 1.21 | Set up Zustand auth store + TanStack Query client | `src/store/authStore.ts`, `QueryClient` | 1 |
| 1.22 | Build OpenAPI client generator script (NSwag / Kiota) | `src/lib/api/` generated client | 1 |
| 1.23 | Build Login page with SSO redirect + local auth fallback | `src/modules/auth/pages/LoginPage.tsx` | 1 |
| 1.24 | Build Forgot/Reset Password pages | `src/modules/auth/pages/` | 1 |
| 1.25 | Build MFA Verification page (TOTP) | `src/modules/auth/pages/MfaPage.tsx` | 1 |
| 1.26 | Build ProtectedRoute with role + permission checks | `src/shared/auth/ProtectedRoute.tsx` | 1 |
| 1.27 | Build Users List page with DataTable, search, filters, export | `src/modules/facility/` — wait, this should be in identity | |
| 1.27 | Build Users List page | `src/modules/users/pages/UsersList.tsx` | 2 |
| 1.28 | Build User Create/Edit forms (react-hook-form + Zod) | `CreateUserPage.tsx`, `EditUserPage.tsx` | 2 |
| 1.29 | Build User Details page | `UserDetailsPage.tsx` | 1 |
| 1.30 | Build Roles List + Permission Matrix page | `RolesList.tsx`, `PermissionMatrix.tsx` | 2 |
| 1.31 | Build Role Create/Edit forms | `CreateRolePage.tsx`, `EditRolePage.tsx` | 1 |
| 1.32 | Build Institution management pages | `InstitutionsList.tsx`, `CreateInstitution.tsx` | 2 |
| 1.33 | Build Dashboard shell with role-based routing | `DashboardPage.tsx` (redirects by role) | 1 |
| 1.34 | Implement i18next with English + Arabic (UAE PDPL) | `src/lib/i18n/`, translation files | 1 |
| 1.35 | Set up Vitest + write tests for auth flow | Unit tests | 1 |

### 4.3 Phase 1 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Authentication** | AuthController, JWT middleware, OIDC integration | Login, MFA, Forgot/Reset Password, Change Password | `Users`, `RefreshTokens` |
| **User Management** | Users CRUD API, search, pagination | Users List, Create, Edit, Details | `Users` |
| **Role Management** | Roles CRUD API, permission assignment | Roles List, Create, Edit, Permission Matrix | `Roles`, `RolePermissions` |
| **Institution Management** | Institutions CRUD API | Institutions List, Create, Edit | `Institutions` |
| **Multi-Tenancy** | Tenant resolution middleware | Tenant selector in settings | All tables (TenantId column) |
| **Foundation** | Logging, event bus, background jobs, search | — | Migration history |

---

## 5. Phase 2 — Facility & Equipment Management (Weeks 5-9)

**Goal:** Complete equipment lifecycle management — asset register, instruments, maintenance, depreciation, chain of custody, QR/barcode.

### 5.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 2.1 | Build Facility module — Facility entity, EF config | `Facilities` table | 1 |
| 2.2 | Build Facility CRUD API | `FacilitiesController`, services, DTOs | 2 |
| 2.3 | Build Asset entity (base for all equipment) | `Assets` table with discriminated inheritance | 2 |
| 2.4 | Build Instrument entity (extends Asset) | `Instruments` table, `InstrumentConfig` | 2 |
| 2.5 | Build Asset CRUD API (full lifecycle) | `AssetsController` — create, read, update, decommission | 3 |
| 2.6 | Build Asset search + filter API | Search by category, status, location, custom fields | 1 |
| 2.7 | Build Asset depreciation engine (straight-line + declining) | `IDepreciationService`, scheduled Hangfire job | 2 |
| 2.8 | Build Chain of Custody — transfer workflow | `CustodyController`, custody events, digital signature | 2 |
| 2.9 | Build QR/Barcode generation service | `IBarcodeService` — generate + print | 1 |
| 2.10 | Build Maintenance schedule + work order system | `MaintenanceRecords`, `WorkOrders` tables | 3 |
| 2.11 | Build Calibration tracking | `CalibrationRecords` table, due-date alerts | 2 |
| 2.12 | Build Room/Facility space management | `Rooms` table, utilization tracking | 2 |
| 2.13 | Build Instrument telemetry ingestion API | `TelemetryController` — POST sensor data | 2 |
| 2.14 | Set up SQL Server temporal tables for asset history | Temporal table on `Assets` | 1 |
| 2.15 | Elasticsearch indexing for assets | `IAssetSearchService` | 1 |
| 2.16 | Integration tests for Facility module | xUnit + Testcontainers | 2 |

### 5.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 2.17 | Build Facilities List page | `FacilitiesList.tsx` — card grid with filters | 2 |
| 2.18 | Build Facility Create/Edit forms | `CreateFacility.tsx`, `EditFacility.tsx` | 1 |
| 2.19 | Build Facility Details page | `FacilityDetails.tsx` — with staff, rooms, assets | 1 |
| 2.20 | Build Asset Register page (DataTable with all filters) | `AssetsList.tsx` — category tabs, search, export | 3 |
| 2.21 | Build Asset Create/Edit forms (dynamic fields by category) | `CreateAsset.tsx`, `EditAsset.tsx` | 2 |
| 2.22 | Build Asset Details page | `AssetDetails.tsx` — timeline, custody chain, telemetry | 2 |
| 2.23 | Build Asset Depreciation view | `AssetDepreciation.tsx` — chart + table | 1 |
| 2.24 | Build Chain of Custody transfer dialog | `CustodyTransferDialog.tsx` — wizard with signature | 2 |
| 2.25 | Build Instruments List page | `InstrumentsList.tsx` — status badges, connection status | 2 |
| 2.26 | Build Instrument Details + Config page | `InstrumentDetails.tsx`, `InstrumentConfig.tsx` | 2 |
| 2.27 | Build Instrument dashboard (online/offline, alerts) | `InstrumentDashboard.tsx` | 1 |
| 2.28 | Build Maintenance scheduler with calendar view | `MaintenanceCalendar.tsx`, `WorkOrderForm.tsx` | 3 |
| 2.29 | Build Calibration records page | `CalibrationRecords.tsx` | 1 |
| 2.30 | Build Room utilization dashboard | `RoomUtilization.tsx` | 1 |
| 2.31 | Build QR code label preview + print dialog | `QrLabelDialog.tsx` | 1 |
| 2.32 | Build Global Search component (header search bar) | `GlobalSearch.tsx` — searches assets, users, bookings | 2 |

### 5.3 Phase 2 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Facility Management** | Facilities CRUD | Facility list, create, edit, details | `Facilities`, `Rooms` |
| **Asset Management** | Assets CRUD, depreciation, lifecycle | Asset register, details, depreciation chart | `Assets` (with temporal) |
| **Instrument Management** | Instruments CRUD, telemetry API | Instrument list, details, config, dashboard | `Instruments`, `InstrumentConfigs` |
| **Chain of Custody** | Custody transfer with e-signature | Transfer dialog, custody timeline | `CustodyEvents` |
| **Maintenance** | Maintenance records, work orders | Maintenance calendar, work order form | `MaintenanceRecords`, `WorkOrders` |
| **Calibration** | Calibration tracking | Calibration records list | `CalibrationRecords` |
| **QR/Barcode** | Barcode generation service | QR label dialog | — |

---

## 6. Phase 3 — Booking & Scheduling (Weeks 8-12)

**Goal:** Online scheduler with calendar, constraints, waitlists, recurring bookings, availability checking.

### 6.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 3.1 | Build Booking entity + EF config | `Bookings` table | 1 |
| 3.2 | Build Booking CRUD API | `BookingsController` — create, read, update, cancel | 2 |
| 3.3 | Build Availability checking engine | `IAvailabilityService` — checks constraints, double-booking | 3 |
| 3.4 | Build Constraint system (training, consumables, staff, maintenance) | `Constraints` table, constraint evaluation engine | 3 |
| 3.5 | Build Waitlist management | `Waitlist` table, auto-promote on cancellation | 2 |
| 3.6 | Build Recurring booking rule engine | `RecurringRules` table, Hangfire job to generate instances | 3 |
| 3.7 | Build Booking cost calculation | `IPricingService` — rate × duration, apply discounts | 2 |
| 3.8 | Build Calendar sync (Outlook/Google via CalDAV + Graph API) | `ICalendarSyncService` — bi-directional sync | 3 |
| 3.9 | Build Trainer availability sync service | Sync trainer Outlook/Google calendar → system | 2 |
| 3.10 | Build Booking conflict detection + overlap reporting | Conflict detection API | 1 |
| 3.11 | Integration tests for Scheduling module | xUnit + Testcontainers | 2 |

### 6.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 3.12 | Build Calendar view (month/week/day) for booking | `SchedulerCalendar.tsx` — drag to book, color by status | 4 |
| 3.13 | Build Booking creation wizard | `CreateBookingWizard.tsx` — select asset, time, confirm | 3 |
| 3.14 | Build Booking details page | `BookingDetails.tsx` — with timeline, cost, edit actions | 2 |
| 3.15 | Build Bookings List page with filters | `BookingsList.tsx` — status, date, asset filters | 2 |
| 3.16 | Build Availability viewer (time grid) | `AvailabilityGrid.tsx` — green/red time slots | 2 |
| 3.17 | Build Waitlist management page | `WaitlistPage.tsx` — position, auto-promote toggle | 1 |
| 3.18 | Build Recurring booking configuration dialog | `RecurringBookingDialog.tsx` — daily/weekly/monthly | 1 |
| 3.19 | Build Constraint configuration pages | `ConstraintsPage.tsx` — manage training/consumable rules | 2 |
| 3.20 | Build Calendar sync settings page | `CalendarSyncSettings.tsx` — OAuth connect Outlook/Google | 1 |
| 3.21 | Build Trainer availability page | `TrainerAvailability.tsx` — weekly schedule grid | 1 |
| 3.22 | Build My Bookings page (for researchers) | `MyBookings.tsx` — personal booking list | 1 |

### 6.3 Phase 3 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Online Scheduler** | Bookings CRUD, availability engine | Calendar view, booking wizard, list, details | `Bookings` |
| **Constraint Engine** | Constraint evaluation, training/consumable checks | Constraint config pages | `Constraints` |
| **Waitlist** | Waitlist CRUD, auto-promote | Waitlist page | `Waitlist` |
| **Recurring Bookings** | Recurring rule engine + generation | Recurring booking dialog | `RecurringRules` |
| **Calendar Sync** | Outlook/Google bi-directional sync | Calendar sync settings | `CalendarSyncLog` |
| **Trainer Sync** | Trainer availability sync | Trainer availability page | `TrainerAvailability` |

---

## 7. Phase 4 — Workflows & Service Requests (Weeks 11-15)

**Goal:** Dynamic form builder, sample/service request submission, reusable workflow engine, project management, issue tracking, inventory.

### 7.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 4.1 | Build Form Builder — dynamic form definition system | `FormDefinitions` table, JSON schema storage | 3 |
| 4.2 | Build Form Builder CRUD API | `FormDefinitionsController` — design forms | 2 |
| 4.3 | Build Service Request entity + CRUD API | `ServiceRequests` table, controller | 2 |
| 4.4 | Build Request submission with dynamic form rendering | Submit API with form data validation | 2 |
| 4.5 | Build Request milestones + progress tracking | `Milestones` table, status transitions | 2 |
| 4.6 | Build Request approvals + routing | `Approvals` table, multi-step approval workflow | 3 |
| 4.7 | Build Workflow Engine — workflow definition API | `WorkflowDefinitions` table, state machine config | 4 |
| 4.8 | Build Workflow Engine — execution engine | Workflow instance runner, state transitions | 4 |
| 4.9 | Build Workflow Engine — notification rules | `NotificationRules` linked to workflow transitions | 2 |
| 4.10 | Build Project Management — projects + work orders | `Projects`, `WorkOrders` tables, CRUD | 3 |
| 4.11 | Build Project cost centers | `CostCenters`, `ProjectBudgets` tables | 2 |
| 4.12 | Build Issue Tracking — issues + ServiceNow/Jira sync | `Issues` table, integration connector | 3 |
| 4.13 | Build Inventory — catalog, pricing, reorder alerts | `InventoryItems`, `Vendors`, `PurchaseOrders` | 4 |
| 4.14 | Build Inventory — barcode scanning support | `IBarcodeScanService` | 1 |
| 4.15 | Integration tests | xUnit + Testcontainers | 3 |

### 7.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 4.16 | Build Form Builder designer UI (drag-and-drop) | `FormBuilder.tsx` — add fields, set validation | 5 |
| 4.17 | Build Form rendering engine (dynamic form display) | `DynamicForm.tsx` — renders form from definition | 3 |
| 4.18 | Build Service Request submission page | `SubmitRequest.tsx` — select form, fill, submit | 2 |
| 4.19 | Build Service Request list + detail pages | `RequestsList.tsx`, `RequestDetails.tsx` | 2 |
| 4.20 | Build Request milestone tracker component | `MilestoneTracker.tsx` — visual progress | 1 |
| 4.21 | Build Request approval dashboard | `ApprovalsDashboard.tsx` — pending approvals | 2 |
| 4.22 | Build Workflow Designer (visual state machine) | `WorkflowDesigner.tsx` — drag states + transitions | 4 |
| 4.23 | Build Workflow execution view | `WorkflowInstanceView.tsx` — current state, history | 2 |
| 4.24 | Build Project dashboard + list | `ProjectsDashboard.tsx`, `ProjectsList.tsx` | 3 |
| 4.25 | Build Work Order management page | `WorkOrdersPage.tsx` — kanban + list views | 2 |
| 4.26 | Build Cost center tracking page | `CostCentersPage.tsx` — budgets vs actuals | 1 |
| 4.27 | Build Issue Tracker (list + create + details) | `IssuesList.tsx`, `CreateIssue.tsx`, `IssueDetails.tsx` | 3 |
| 4.28 | Build Inventory Dashboard | `InventoryDashboard.tsx` — low stock alerts, expiring items | 2 |
| 4.29 | Build Inventory Item list + create/edit | `InventoryItemsList.tsx`, `InventoryItemForm.tsx` | 2 |
| 4.30 | Build Purchase Order management | `PurchaseOrdersList.tsx`, `CreatePurchaseOrder.tsx` | 2 |
| 4.31 | Build Vendor management pages | `VendorsList.tsx`, `VendorDetails.tsx` | 1 |

### 7.3 Phase 4 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Form Builder** | Form definition CRUD, dynamic rendering | Form designer UI, dynamic form renderer | `FormDefinitions` |
| **Service Requests** | Request CRUD, milestones, approvals | Request submission, list, details, approval dashboard | `ServiceRequests`, `Milestones`, `Approvals` |
| **Workflow Engine** | Workflow definition + execution engine | Workflow designer, instance view | `WorkflowDefinitions`, `WorkflowInstances` |
| **Project Management** | Projects, work orders, cost centers | Project dashboard, work order kanban, cost center view | `Projects`, `WorkOrders`, `CostCenters` |
| **Issue Tracking** | Issues CRUD, ServiceNow/Jira sync | Issue list, create, details | `Issues` |
| **Inventory** | Inventory CRUD, reorder alerts, barcode | Inventory dashboard, item management, POs, vendors | `InventoryItems`, `Vendors`, `PurchaseOrders` |

---

## 8. Phase 5 — Financial & Compliance (Weeks 14-18)

**Goal:** Invoicing, ERP integration, pricing models, immutable audit logs, e-signatures.

### 8.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 5.1 | Build Invoice entity + EF config | `Invoices` table, `InvoiceLineItems` | 1 |
| 5.2 | Build Invoice generation engine (from bookings/requests) | `IInvoiceGenerationService` | 3 |
| 5.3 | Build Invoice CRUD API | `InvoicesController` — create, read, update, cancel, void | 2 |
| 5.4 | Build PDF invoice generation (custom templates) | `IInvoicePdfService` — HTML→PDF with Razor templates | 3 |
| 5.5 | Build Pricing Model engine | `PricingModels` table, rate calculation service | 3 |
| 5.6 | Build Internal vs External rate support | Dual-rate evaluation, rate tables | 2 |
| 5.7 | Build Rebate + Membership credit system | `Rebates`, `Credits` tables | 2 |
| 5.8 | Build VAT/Tax code management | `TaxCodes` table, multi-jurisdiction tax calc | 2 |
| 5.9 | Build Oracle Fusion ERP integration connector | `IErpIntegrationService` — SOAP/REST sync | 4 |
| 5.10 | Build ERP posting workflow (invoice → ERP → status update) | Hangfire job for ERP sync retry | 2 |
| 5.11 | Build Compliance — Immutable Audit Log | `AuditLogs` table (hash-chain, no delete), `IAuditService` | 4 |
| 5.12 | Build Audit log query + export API | `AuditController` — filter, search, CSV/PDF export | 2 |
| 5.13 | Build E-Signature service | `ISignatureService` — capture, verify, store | 2 |
| 5.14 | Build Reason-for-change tracking | Change records attached to critical entities | 1 |
| 5.15 | Build Asset Value + Depreciation reports | `AssetReportController` | 2 |
| 5.16 | Integration tests | xUnit + Testcontainers | 2 |

### 8.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 5.17 | Build Invoices List page | `InvoicesList.tsx` — status tabs, search, export | 2 |
| 5.18 | Build Invoice Details page | `InvoiceDetails.tsx` — line items, payments, PDF preview | 2 |
| 5.19 | Build Invoice Create page (manual + from booking) | `CreateInvoice.tsx` — multi-step wizard | 3 |
| 5.20 | Build Invoice PDF preview + download | `InvoicePdfPreview.tsx` | 1 |
| 5.21 | Build Pricing Model configuration page | `PricingModelsPage.tsx` — rate tables, effective dates | 3 |
| 5.22 | Build Internal/External rate editor | `RateEditor.tsx` | 1 |
| 5.23 | Build Rebate + Credit management pages | `RebatesPage.tsx`, `CreditsPage.tsx` | 1 |
| 5.24 | Build Tax code configuration page | `TaxCodesPage.tsx` — manage VAT rates | 1 |
| 5.25 | Build ERP sync status dashboard | `ErpSyncDashboard.tsx` — sync status, retry, errors | 2 |
| 5.26 | Build Audit Log viewer | `AuditLogsPage.tsx` — filterable, searchable, exportable | 3 |
| 5.27 | Build E-Signature capture dialog | `SignaturePad.tsx` — canvas-based signature capture | 2 |
| 5.28 | Build Change history component (reusable) | `ChangeHistory.tsx` — show audit trail on any entity | 2 |
| 5.29 | Build Asset Depreciation report page | `DepreciationReports.tsx` | 1 |
| 5.30 | Build Financial Dashboard | `FinancialDashboard.tsx` — revenue, outstanding, aging | 2 |

### 8.3 Phase 5 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Invoicing** | Invoice generation, CRUD, PDF, ERP sync | Invoice list, details, create, PDF preview | `Invoices`, `InvoiceLineItems` |
| **Pricing Models** | Rate engine, internal/external, rebates, credits | Pricing config, rate editor, rebate management | `PricingModels`, `RateTables`, `Rebates`, `Credits` |
| **Tax Management** | VAT/tax code calculation | Tax code config page | `TaxCodes` |
| **ERP Integration** | Oracle Fusion sync connector | ERP sync dashboard | `ErpSyncLog` |
| **Audit & Compliance** | Immutable audit logs, query/export | Audit log viewer, change history component | `AuditLogs` |
| **E-Signatures** | Signature capture, verify, store | Signature pad dialog | `Signatures` |

---

## 9. Phase 6 — Analytics & BI (Weeks 17-21)

**Goal:** Configurable dashboards, drag-and-drop widgets, ad-hoc reporting, Instrument 365 View, scheduled email reports.

### 9.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 6.1 | Build Dashboard Definition entity + EF config | `DashboardDefinitions` table | 1 |
| 6.2 | Build Dashboard CRUD API | `DashboardsController` — save/load layout | 2 |
| 6.3 | Build Widget data provider framework | `IWidgetDataSource` — pluggable data sources | 3 |
| 6.4 | Build KPI widget data sources | KPIs: revenue, utilization, bookings, etc. | 2 |
| 6.5 | Build Chart widget data sources (time-series, bar, pie) | Chart data aggregation queries | 3 |
| 6.6 | Build Instrument 365 View aggregation service | 365-day instrument metrics: usage, downtime, revenue, service | 4 |
| 6.7 | Build Ad-hoc report engine (custom fields, filters) | `IReportService` — dynamic query builder | 4 |
| 6.8 | Build Report export (PDF, CSV, Excel) | `IReportExportService` — EPPlus + Razor PDF | 3 |
| 6.9 | Build Scheduled report delivery (email) | `ReportSchedule` table, Hangfire cron jobs | 2 |
| 6.10 | Build Analytics aggregation jobs (daily/weekly rollups) | Hangfire recurring jobs for pre-aggregated data | 2 |
| 6.11 | Build SQL Server views + indexed views for common queries | Performance optimization | 2 |
| 6.12 | Integration tests | xUnit + Testcontainers | 2 |

### 9.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 6.13 | Build Dashboard grid layout (react-grid-layout) | `DashboardGrid.tsx` — drag to resize/reorder | 3 |
| 6.14 | Build Widget picker + configuration dialog | `WidgetPicker.tsx`, `WidgetConfigDialog.tsx` | 2 |
| 6.15 | Build KPI Widget component | `KpiWidget.tsx` — metric with trend indicator | 1 |
| 6.16 | Build Chart Widget component (line, bar, pie, area) | `ChartWidget.tsx` — wraps Recharts | 2 |
| 6.17 | Build Table Widget component | `TableWidget.tsx` — sortable, filterable | 1 |
| 6.18 | Build Instrument 365 View page | `Instrument365View.tsx` — full-year heatmap + metrics | 3 |
| 6.19 | Build Ad-hoc report builder UI | `ReportBuilder.tsx` — drag fields, apply filters, run | 5 |
| 6.20 | Build Report results viewer | `ReportViewer.tsx` — table + chart preview | 2 |
| 6.21 | Build Report schedule configuration | `ReportScheduleDialog.tsx` — cron, recipients, format | 2 |
| 6.22 | Build Analytics Dashboard home page | `AnalyticsHome.tsx` — saved dashboards, recent reports | 1 |
| 6.23 | Build Dashboard sharing (with other users) | `DashboardShareDialog.tsx` | 1 |

### 9.3 Phase 6 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Configurable Dashboards** | Dashboard CRUD, widget data sources | Draggable grid, widget picker, config | `DashboardDefinitions`, `DashboardWidgets` |
| **Ad-Hoc Reporting** | Dynamic report engine, export (PDF/CSV/Excel) | Report builder UI, results viewer | `ReportDefinitions` |
| **Scheduled Reports** | Cron-based email delivery | Report schedule config | `ReportSchedules` |
| **Instrument 365 View** | 365-day aggregation service | Instrument 365 page with heatmap | Materialized views |
| **Analytics** | Pre-aggregation jobs | Analytics home, dashboard sharing | Aggregation tables |

---

## 10. Phase 7 — Communication, Training & Notifications (Weeks 20-24)

**Goal:** Training module with competency tracking, announcements, notification center (email/SMS/Teams), help & support guide, publication tracking.

### 10.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 7.1 | Build Training module — competencies + prerequisites | `Competencies` table, `UserCompetencies` | 2 |
| 7.2 | Build Booking gating engine (prerequisite check before booking) | `IPrerequisiteService` — blocks booking if unmet | 2 |
| 7.3 | Build Competency expiry management + renewal workflow | Hangfire job for expiry alerts | 2 |
| 7.4 | Build Announcements CRUD API | `AnnouncementsController` | 1 |
| 7.5 | Build Facility homepage builder — widgets + layout | `HomepageDefinitions` table | 3 |
| 7.6 | Build Publications tracking | `Publications` table, CRUD | 2 |
| 7.7 | Build Notification templates (email, SMS, Teams) | `NotificationTemplates` table | 2 |
| 7.8 | Build Email delivery service (SMTP + SendGrid) | `IEmailService` | 2 |
| 7.9 | Build SMS delivery service (Twilio) | `ISmsService` | 1 |
| 7.10 | Build Teams webhook notification | `ITeamsNotificationService` | 1 |
| 7.11 | Build In-app notification system (SignalR) | `INotificationService`, SignalR hub | 2 |
| 7.12 | Build Notification preference management | `NotificationPreferences` table | 1 |
| 7.13 | Build Help content management (markdown/Rich Text) | `HelpArticles` table, CRUD | 2 |
| 7.14 | Build Walkthrough/onboarding system | `Walkthroughs` table, step definitions | 2 |
| 7.15 | Integration tests | xUnit + Testcontainers | 2 |

### 10.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 7.16 | Build Training dashboard | `TrainingDashboard.tsx` — competencies, expiry calendar | 2 |
| 7.17 | Build Competency matrix page | `CompetencyMatrix.tsx` — user × competency grid | 2 |
| 7.18 | Build Prerequisite warning component (booking flow) | `PrerequisiteCheck.tsx` — shows unmet prerequisites | 1 |
| 7.19 | Build Announcements list + create page | `AnnouncementsList.tsx`, `CreateAnnouncement.tsx` | 1 |
| 7.20 | Build Facility homepage builder (drag widgets) | `HomepageBuilder.tsx` | 3 |
| 7.21 | Build Publications tracking page | `PublicationsList.tsx`, `AddPublication.tsx` | 1 |
| 7.22 | Build Notification Center (in-app) | `NotificationCenter.tsx` — real-time via SignalR | 2 |
| 7.23 | Build Notification preference settings | `NotificationPreferences.tsx` | 1 |
| 7.24 | Build Email/SMS template editor | `EmailTemplateEditor.tsx`, `SmsTemplateEditor.tsx` | 2 |
| 7.25 | Build Help & Support center | `HelpCenter.tsx` — searchable articles, categories | 3 |
| 7.26 | Build Interactive walkthrough component | `Walkthrough.tsx` — step-by-step guide overlay | 2 |

### 10.3 Phase 7 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **Training** | Competencies, prerequisites, expiry | Training dashboard, competency matrix | `Competencies`, `UserCompetencies` |
| **Announcements** | Announcements CRUD | Announcements list, create | `Announcements` |
| **Facility Homepage** | Homepage definition CRUD | Drag-and-drop homepage builder | `HomepageDefinitions` |
| **Publications** | Publications CRUD | Publications list | `Publications` |
| **Notification Center** | Email/SMS/Teams delivery, SignalR | In-app notification center, preferences, template editor | `Notifications`, `NotificationTemplates`, `NotificationPreferences` |
| **Help & Support** | Help articles CRUD, walkthroughs | Help center, walkthrough overlay | `HelpArticles`, `Walkthroughs` |

---

## 11. Phase 8 — AI Modules M1-M4 (Weeks 23-28)

**Goal:** AI Helpdesk, Talk-to-Action, Equipment FAQ/KB, IoT Integration & Automation.

### 11.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 8.1 | Set up LLM integration layer (Ollama + OpenAI fallback) | `ILlmService` — abstraction over LLM providers | 3 |
| 8.2 | Set up Vector DB (SQL Server with pgvector? — use Azure AI Search) | Vector search indexing pipeline | 2 |
| 8.3 | Build RAG pipeline — document indexing + retrieval | `IRagService` — chunk, embed, store, retrieve | 4 |
| 8.4 | Build MCP Server implementation in .NET | `McpServer` — tool registration, execution, audit | 4 |
| 8.5 | Build M1: AI Helpdesk — chat endpoint (SignalR) | `HelpdeskHub` — multi-turn chat with RAG | 4 |
| 8.6 | Build M1: Ticket creation from chat | Auto-create issue/ticket from conversation | 2 |
| 8.7 | Build M1: SLA + performance dashboard data | Helpdesk metrics aggregation | 2 |
| 8.8 | Build M2: Talk-to-Action — intent classification | `IActionOrchestrator` — NL→system command | 4 |
| 8.9 | Build M2: Dry-run preview engine | Dry-run simulates action without execution | 2 |
| 8.10 | Build M2: Safe-action guardrails | `IGuardrailService` — prohibit dangerous actions | 2 |
| 8.11 | Build M3: Equipment FAQ — SOP/manual indexing | Index SOP PDFs → vector DB | 2 |
| 8.12 | Build M3: QR-linked contextual FAQ | QR code → instrument → relevant FAQ retrieval | 2 |
| 8.13 | Build M4: IoT Ingestion pipeline (OPC-UA, MQTT, Modbus) | `IIoTIngestionService` — protocol adapters | 5 |
| 8.14 | Build M4: Threshold-based alert engine | `IAlertEngine` — compare telemetry vs thresholds | 3 |
| 8.15 | Build M4: Soft→hard action automation | Automated equipment control with safety gates | 3 |
| 8.16 | Build M4: IoT security layer (device certs, encrypted channels) | Device authentication, TLS mutual | 2 |
| 8.17 | Integration tests | xUnit + Testcontainers | 3 |

### 11.2 Frontend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 8.18 | Build M1: Helpdesk chat interface | `HelpdeskChat.tsx` — message bubbles, file upload, citations | 3 |
| 8.19 | Build M1: Ticket creation dialog (from chat) | `CreateTicketDialog.tsx` | 1 |
| 8.20 | Build M1: Helpdesk SLA dashboard | `HelpdeskSlaDashboard.tsx` — metrics, queue | 2 |
| 8.21 | Build M2: Talk-to-Action interface | `TalkToAction.tsx` — command input, dry-run preview, confirm | 3 |
| 8.22 | Build M2: Action history log | `ActionHistory.tsx` — all NL actions with results | 1 |
| 8.23 | Build M3: Equipment FAQ page | `EquipmentFaq.tsx` — search, browse by instrument, QR scan | 2 |
| 8.24 | Build M3: SOP viewer | `SopViewer.tsx` — embedded PDF viewer with citation highlights | 2 |
| 8.25 | Build M4: IoT Dashboard (real-time telemetry) | `IoTDashboard.tsx` — live gauges, charts, alerts | 4 |
| 8.26 | Build M4: Alert management page | `IoTAlerts.tsx` — acknowledge, resolve, history | 1 |
| 8.27 | Build M4: Automated action configuration | `AutomationRules.tsx` — if-then rule builder | 2 |

### 11.3 Phase 8 Deliverables — Complete Modules

| Module | Backend | Frontend | DB Tables |
|--------|---------|----------|-----------|
| **M1: AI Helpdesk** | LLM chat, RAG, ticket creation, SLA metrics | Chat interface, ticket dialog, SLA dashboard | `HelpdeskConversations`, `HelpdeskTickets` |
| **M2: Talk-to-Action** | Intent classification, dry-run, guardrails | Command interface, action history | `ActionLogs` |
| **M3: Equipment FAQ/KB** | SOP indexing, RAG, QR context | FAQ page, SOP viewer | Vector index |
| **M4: IoT Automation** | OPC-UA/MQTT ingestion, alert engine, auto-actions | IoT dashboard, alerts, automation rules | `IoTTelemetry` (TimescaleDB), `IoTAlerts`, `AutomationRules` |
| **MCP Protocol** | MCP server with tool registry | — (used by AI agents) | `McpToolLogs` |

---

## 12. Phase 9 — AI Modules M5-M7 + Mobile (Weeks 27-32)

**Goal:** Predictive maintenance, planning & optimization, self-evolution, iOS/Android mobile apps.

### 12.1 Backend Tasks

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 9.1 | Build M5: Predictive Maintenance — RUL modeling pipeline | `IRulService` — ML model for remaining useful life | 4 |
| 9.2 | Build M5: Failure mode classification | Failure mode analysis from telemetry patterns | 3 |
| 9.3 | Build M5: Automated work order generation | Generate work order when failure predicted | 2 |
| 9.4 | Build M5: Fix blueprint + recommendation engine | `IBlueprintService` — suggest fix steps + parts | 3 |
| 9.5 | Build M5: Technician TODO list generation | Auto-generated tasks for facility technician | 2 |
| 9.6 | Build M5: Feedback loop (sensor + technician feedback) | Outcome tracking → model improvement | 2 |
| 9.7 | Build M6: Capacity modeling engine | `ICapacityService` — predict utilization, suggest changes | 4 |
| 9.8 | Build M6: Batching optimization | `IBatchingService` — optimal batch scheduling | 3 |
| 9.9 | Build M6: Energy optimization | Energy consumption analysis + recommendations | 3 |
| 9.10 | Build M6: Fairness policy enforcement | Fair allocation across PIs/groups | 2 |
| 9.11 | Build M6: Feedback collection (passive + active) | Sensor data + technician surveys | 2 |
| 9.12 | Build M7: Gap analysis engine | Analyze system usage vs expected patterns | 4 |
| 9.13 | Build M7: Module design generator | Auto-generate workflow/config suggestions | 3 |
| 9.14 | Build M7: Supervised deployment pipeline | Approval gate before auto-changes deployed | 3 |
| 9.15 | Build M7: Post-deployment effectiveness tracking | Measure improvement after changes | 2 |
| 9.16 | Build M7: Iterative refinement cycle | Continuous improvement loop | 2 |
| 9.17 | Integration tests for all AI modules | xUnit + Testcontainers | 3 |

### 12.2 Mobile App Tasks (iOS + Android)

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 9.18 | Set up iOS project (SwiftUI) + API client | iOS project, REST client, auth | 3 |
| 9.19 | Set up Android project (Jetpack Compose) + API client | Android project, Retrofit, auth | 3 |
| 9.20 | Mobile: Login + MFA + SSO flow | Auth screens (both platforms) | 2 |
| 9.21 | Mobile: Dashboard (role-based KPIs) | Dashboard screen | 2 |
| 9.22 | Mobile: Equipment list + barcode scanner | Asset list, camera barcode scan | 3 |
| 9.23 | Mobile: Booking calendar (view + create) | Calendar screen, booking form | 3 |
| 9.24 | Mobile: Service request submission | Request form from dynamic definition | 2 |
| 9.25 | Mobile: Notification center | Push notifications via SignalR | 2 |
| 9.26 | Mobile: Helpdesk chat (M1) | Chat interface | 2 |
| 9.27 | Mobile: QR code scanner for equipment FAQ (M3) | QR scan → FAQ display | 2 |
| 9.28 | Mobile: Offline SOP access | Download + view SOPs offline | 2 |
| 9.29 | Mobile: MDM/Intune integration configuration | Device compliance, app config | 2 |

### 12.3 Frontend Tasks (Web)

| # | Task | Deliverable | Est. Days |
|---|------|------------|:---------:|
| 9.30 | Build M5: Predictive Maintenance dashboard | `PredictiveMaintenance.tsx` — RUL charts, failure predictions | 3 |
| 9.31 | Build M5: Work order generation preview | `WorkOrderPreview.tsx` — blueprint + parts + steps | 2 |
| 9.32 | Build M5: Technician TODO board | `TechnicianTodo.tsx` — assigned tasks, complete, feedback | 2 |
| 9.33 | Build M6: Capacity planning dashboard | `CapacityDashboard.tsx` — utilization forecasts | 2 |
| 9.34 | Build M6: Batching optimization page | `BatchingOptimizer.tsx` — suggested batch configs | 2 |
| 9.35 | Build M6: Energy analytics page | `EnergyAnalytics.tsx` — consumption, savings | 2 |
| 9.36 | Build M6: Fairness policy config | `FairnessPolicyPage.tsx` | 1 |
| 9.37 | Build M7: Gap analysis results page | `GapAnalysis.tsx` — detected gaps + suggestions | 3 |
| 9.38 | Build M7: Module deployment approval workflow | `DeploymentApproval.tsx` — review, approve/reject | 2 |
| 9.39 | Build M7: Effectiveness tracking dashboard | `EffectivenessDashboard.tsx` — before/after metrics | 2 |

### 12.4 Phase 9 Deliverables — Complete Modules

| Module | Backend | Frontend | Mobile |
|--------|---------|----------|--------|
| **M5: Predictive Maintenance** | RUL, failure mode, work order gen, fix blueprint | PM dashboard, work order preview, TODO board | — |
| **M6: Planning & Optimization** | Capacity, batching, energy, fairness | Capacity dashboard, optimizer, energy analytics, fairness config | — |
| **M7: Self-Evolution** | Gap analysis, module design, supervised deploy | Gap analysis results, approval workflow, effectiveness tracking | — |
| **iOS App** | — | — | Auth, dashboard, equipment, booking, requests, notifications, chat, QR, offline SOP, MDM |
| **Android App** | — | — | Auth, dashboard, equipment, booking, requests, notifications, chat, QR, offline SOP, MDM |

---

## 13. Backend Architecture Patterns

### 13.1 Clean Architecture per Module

```
Modules/Facility/
├── Domain/
│   ├── Entities/
│   │   ├── Asset.cs
│   │   ├── Instrument.cs
│   │   └── Facility.cs
│   ├── ValueObjects/
│   │   ├── AssetStatus.cs
│   │   └── DepreciationMethod.cs
│   └── Interfaces/
│       ├── IAssetRepository.cs
│       └── IAssetSearchService.cs
├── Application/
│   ├── Commands/
│   │   ├── CreateAssetCommand.cs
│   │   └── TransferCustodyCommand.cs
│   ├── Queries/
│   │   ├── GetAssetByIdQuery.cs
│   │   └── SearchAssetsQuery.cs
│   ├── DTOs/
│   │   ├── AssetDto.cs
│   │   └── AssetListDto.cs
│   └── Validators/
│       ├── CreateAssetValidator.cs
│       └── TransferCustodyValidator.cs
├── Infrastructure/
│   ├── Persistence/
│   │   ├── AssetRepository.cs
│   │   └── FacilityDbContext.cs
│   └── Services/
│       ├── DepreciationService.cs
│       └── BarcodeService.cs
└── Api/
    ├── AssetsController.cs
    └── FacilitiesController.cs
```

### 13.2 CQRS with MediatR

```csharp
// Command
public record CreateAssetCommand(string Name, string Model, Guid FacilityId) : IRequest<Guid>;

public class CreateAssetHandler : IRequestHandler<CreateAssetCommand, Guid>
{
    private readonly IAssetRepository _repository;
    private readonly IEventBus _eventBus;

    public async Task<Guid> Handle(CreateAssetCommand request, CancellationToken ct)
    {
        var asset = Asset.Create(request.Name, request.Model, request.FacilityId);
        await _repository.AddAsync(asset, ct);
        await _eventBus.PublishAsync(new AssetCreatedEvent(asset.Id), ct);
        return asset.Id;
    }
}

// Controller
[ApiController]
[Route("api/v1/assets")]
public class AssetsController : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateAssetCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }
}
```

### 13.3 Multi-Tenant Pattern

```csharp
// Tenant Middleware
public class TenantMiddleware
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        var tenantId = context.Request.Headers["X-Tenant-Id"].FirstOrDefault()
                    ?? context.Request.Host.Host.Split('.')[0]; // subdomain
        tenantContext.SetTenant(Guid.Parse(tenantId));
        await _next(context);
    }
}

// EF Core Global Query Filter
protected override void OnModelCreating(ModelBuilder builder)
{
    builder.Entity<Asset>().HasQueryFilter(a => a.TenantId == _tenantContext.TenantId);
}
```

### 13.4 Event Bus with RabbitMQ + MassTransit

```csharp
// Publish
public class AssetCreatedEvent : IEvent
{
    public Guid AssetId { get; set; }
    public Guid TenantId { get; set; }
}

await _bus.Publish(new AssetCreatedEvent { AssetId = id, TenantId = tenantId });

// Consume (another service)
public class AssetCreatedConsumer : IConsumer<AssetCreatedEvent>
{
    public async Task Consume(ConsumeContext<AssetCreatedEvent> context)
    {
        // Index in Elasticsearch, send notification, etc.
    }
}
```

---

## 14. Technology Reference

### .NET Core Packages

| Package | Purpose |
|---------|---------|
| Microsoft.AspNetCore.Authentication.JwtBearer | JWT auth |
| Microsoft.EntityFrameworkCore.SqlServer | EF Core SQL Server provider |
| MediatR | CQRS |
| FluentValidation.AspNetCore | Request validation |
| AutoMapper / Mapster | DTO mapping |
| MassTransit.RabbitMQ | Event bus |
| Hangfire | Background jobs |
| Serilog.AspNetCore | Logging |
| Swashbuckle.AspNetCore | Swagger/OpenAPI |
| EPPlus | Excel export |
| QuestPDF / DinkToPdf | PDF generation |
| Microsoft.AspNetCore.SignalR | Real-time communication |
| Nest (Elasticsearch.Net) | Elasticsearch client |
| StackExchange.Redis | Redis client |
| xUnit + Moq + Testcontainers | Testing |

### Frontend Packages (Same as Existing + Additions)

| Package | Purpose |
|---------|---------|
| react-hook-form + @hookform/resolvers + zod | Form validation (was unused in existing, will be used here) |
| @tanstack/react-query | Server state |
| zustand | Client state |
| axios | HTTP client |
| i18next + react-i18next | Internationalization |
| react-grid-layout | Dashboard drag-and-drop |
| react-beautiful-dnd | Kanban/workflow designer |
| @react-pdf/renderer | PDF preview |
| recharts | Charts |
| lucide-react | Icons |
| date-fns | Date utilities |

---

## Appendix A: Database Table Inventory

| Phase | Tables Created |
|:-----:|---------------|
| P1 | `Tenants`, `Users`, `Roles`, `RolePermissions`, `UserRoles`, `AbacRules`, `RefreshTokens`, `Institutions`, `AuditLogs` (foundation) |
| P2 | `Facilities`, `Rooms`, `Assets`, `Instruments`, `InstrumentConfigs`, `CustodyEvents`, `MaintenanceRecords`, `WorkOrders`, `CalibrationRecords` |
| P3 | `Bookings`, `BookingConstraints`, `WaitlistEntries`, `RecurringRules`, `CalendarSyncLogs`, `TrainerAvailability` |
| P4 | `FormDefinitions`, `ServiceRequests`, `RequestMilestones`, `Approvals`, `WorkflowDefinitions`, `WorkflowInstances`, `Projects`, `WorkOrders`, `CostCenters`, `Issues`, `InventoryItems`, `Vendors`, `PurchaseOrders` |
| P5 | `Invoices`, `InvoiceLineItems`, `PricingModels`, `RateTables`, `Rebates`, `Credits`, `TaxCodes`, `ErpSyncLogs`, `Signatures` |
| P6 | `DashboardDefinitions`, `DashboardWidgets`, `ReportDefinitions`, `ReportSchedules`, `AggregationTables` |
| P7 | `Competencies`, `UserCompetencies`, `Announcements`, `HomepageDefinitions`, `Publications`, `NotificationTemplates`, `Notifications`, `NotificationPreferences`, `HelpArticles`, `Walkthroughs` |
| P8 | `HelpdeskConversations`, `HelpdeskTickets`, `ActionLogs`, `IoTTelemetry`, `IoTAlerts`, `AutomationRules`, `McpToolLogs` |
| P9 | `RulModels`, `FailureModePredictions`, `FixBlueprints`, `CapacityPredictions`, `BatchOptimizations`, `EnergyMetrics`, `GapAnalysisResults`, `DeploymentApprovals` |

## Appendix B: Reuse Checklist from `lims-frontend`

| File | Action | Est. Time |
|------|--------|:---------:|
| `src/components/ui/*` (27 files) | **Copy** directly | 1 hr |
| `src/components/forms/*` (11 files) | **Copy** directly | 30 min |
| `src/components/layout/app-layout.tsx` | **Copy** — update sidebar nav items | 30 min |
| `src/components/layout/sidebar.tsx` | **Copy** — rewrite nav categories for Research LMS | 1 hr |
| `src/components/layout/header.tsx` | **Copy** — update user menu, add global search | 30 min |
| `src/components/shared/*` (8 files) | **Copy** directly | 30 min |
| `src/lib/utils.ts` | **Copy** directly | 5 min |
| `src/lib/api.ts` | **Rewrite** — use Axios with real API | 1 hr |
| `src/store/appStore.ts` | **Rewrite** — new app state (tenant, sidebar) | 30 min |
| `src/store/authStore.ts` | **Rewrite** — OIDC + JWT flow | 2 hrs |
| `vite.config.ts` | **Copy** directly | 5 min |
| `tailwind.config.ts` / CSS | **Copy** directly | 5 min |
| `package.json` deps | **Copy** + add axios, i18next, react-grid-layout | 15 min |
| **Total reuse** | | **~8 hours** |
