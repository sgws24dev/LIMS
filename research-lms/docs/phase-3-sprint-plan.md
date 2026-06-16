# Phase 3 — Booking & Scheduling: Sprint Plan

**Timeline:** Weeks 8–12 (4 weeks @ 5 days = 20 working days)  
**Status:** Greenfield — no existing Scheduling code  
**Dependency on Phase 2:** Facility module is complete — assets, instruments, maintenance records exist and are referenceable by Booking via `AssetId`. Shared infrastructure (multi-tenancy, DbContext, MediatR, FluentValidation, Serilog, MassTransit, Docker Compose) already in place.

---

## Scope Summary

| Area | Backend Tasks | Frontend Tasks | DB Tables | Est. Effort |
|------|:-------------:|:--------------:|-----------|:-----------:|
| Booking Core (CRUD + Calendar) | 3.1, 3.2 | 3.12, 3.13, 3.14, 3.15, 3.22 | `Bookings` | 14 days |
| Availability & Constraints | 3.3, 3.4, 3.10 | 3.16, 3.19 | `Constraints` | 11 days |
| Waitlist & Recurring | 3.5, 3.6 | 3.17, 3.18 | `Waitlist`, `RecurringRules` | 7 days |
| Cost Calculation | 3.7 | (included in booking wizard) | — | 2 days |
| Calendar Sync & Trainer | 3.8, 3.9 | 3.20, 3.21 | `CalendarSyncLog`, `TrainerAvailability` | 7 days |
| Integration Tests | 3.11 | — | — | 2 days |
| **Total** | **11 backend** | **11 frontend** | **6 tables** | **~43 days** |

---

## Architecture Decisions

### Service Boundary
Scheduling runs as a new **Scheduling microservice** under `Services/Scheduling/` following Clean Architecture (Domain, Application, Infrastructure, Api). This is a separate service from Facility because:
- Booking has its own throughput and scaling profile (read-heavy, many concurrent users).
- It can be developed and deployed independently.
- Cross-service references use the shared `ResearchLms.Shared` kernel (e.g. `ResourceType` enum, `IBookingResourceProvider` interface).

### Cross-Service Resource Reference
Bookings reference assets by `ResourceId` (Guid) with a discriminator `ResourceType` (`"Instrument"`, `"Equipment"`, `"Room"`). The Scheduling service does **not** hold a direct FK to the `Assets` table; instead it uses an event-driven cache via MassTransit consumers (`AssetCreatedEvent`, `AssetDecommissionedEvent`) to keep a lightweight `BookingResources` projection table in the Scheduling DB. This avoids cross-DB foreign keys and keeps services decoupled.

### Booking Status State Machine
```
Pending → Confirmed → InProgress → Completed
                    ↘ Cancelled
           → NoShow
```
Status transitions are validated by a `BookingStateMachine` class in the Application layer using a simple rules table (no external state machine library needed initially). Hangfire jobs handle `NoShow` auto-transition if check-in is missed.

### Recurring Booking Strategy
Recurring rules are stored as a single `RecurringRule` row with a cron-like expression and effective date range. A Hangfire recurring job runs nightly to materialize the next N instances (configurable, default 90 days) into the `Bookings` table. Cancelling a single instance leaves the rule intact; cancelling the rule cancels all future instances.

### Data Isolation
The Scheduling service gets its own `SchedulingDbContext` with its own connection string (`SchedulingDb`). Multi-tenancy is enforced via the same `ITenantContext` + global query filter pattern used in Facility.

### Frontend Routing
All scheduling pages live under `frontend/src/modules/scheduler/pages/` and are served at `/scheduling/*` routes.

---

## Sprint Breakdown

---

### Sprint 1 — Booking Core (Days 1–5)

**Theme:** Booking data model, CRUD API, and foundational calendar + booking wizard UI.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 3.1 | Booking entity + EF config | `Booking` entity, `BookingResources` projection, `SchedulingDbContext` | Fields: TenantId, ResourceId, ResourceType, UserId, Title, StartTime, EndTime, Status (Pending/Confirmed/Cancelled/InProgress/Completed/NoShow), Purpose, Notes, CreatedAt, UpdatedAt. `BookingResources` is a lightweight cache synced from Facility via MassTransit. Configuration maps to `Bookings` table with tenant + resource indexes. Register `SchedulingDbContext` in DI. |
| 3.2 | Booking CRUD API | `BookingsController` | Standard REST: GET list (paginated, filtered by user/resource/date range/status), GET by id, POST create, PUT update, PATCH cancel. MediatR commands/queries. FluentValidation. Route: `/api/v1/scheduling/bookings`. Validate no double-booking on create (basic check — full engine in Sprint 2). `CancelBooking` sets status to `Cancelled` with reason/timestamp. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 3.12 | Calendar view (month/week/day) | `scheduler/pages/scheduler-calendar.tsx` — Recharts-based month/week/day toggle. Color-coded by status (green=confirmed, amber=pending, red=cancelled). Click a slot → open booking wizard. Click existing booking → open details. Responsive grid layout. |
| 3.13 | Booking creation wizard | `scheduler/pages/create-booking-wizard.tsx` — 3-step wizard: (1) Select resource + date/time, (2) Enter purpose/notes, (3) Confirm & submit. react-hook-form + Zod validation. Time-slot picker with 15-min intervals. |

**Sprint 1 Deliverables:** `Bookings` table, `BookingResources` projection table, full Booking CRUD API, calendar view (month/week/day), booking creation wizard.

---

### Sprint 2 — Availability, Constraints & Waitlist (Days 6–10)

**Theme:** Availability checking engine, constraint evaluation, waitlist management, and corresponding frontend components.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 3.3 | Availability checking engine | `IAvailabilityService` | Query available time slots for a resource+date range. Checks: existing bookings (non-cancelled), maintenance schedules (from `MaintenanceRecords` — fetched via MassTransit or direct shared-DB read), operating hours from `Facility`, blackout dates, max booking duration. Returns list of free time windows. Cached with Redis (5-min TTL). |
| 3.4 | Constraint system | `Constraint` entity, `ConstraintEvaluationService` | Three constraint types: (a) **Training prerequisite** — user must hold competency X before booking resource Y; (b) **Consumable availability** — resource Z requires consumable A in stock; (c) **Staff requirement** — resource requires certified operator present. `Constraints` table stores rules. Evaluation engine runs at booking time and returns detailed violation messages. |
| 3.5 | Waitlist management | `WaitlistEntry` entity, `WaitlistService` | Users join waitlist for a resource+time window. When a booking is cancelled, a Hangfire job checks the waitlist and auto-promotes the next user (sends notification, creates provisional booking with 24hr expiry). Fields: TenantId, ResourceId, ResourceType, Date, StartTime, EndTime, RequestedBy, Priority (FIFO default), CreatedAt, IsPromoted, ExpiresAt. |
| 3.10 | Booking conflict detection + overlap reporting | Conflict detection API | `GET /api/v1/scheduling/conflicts?resourceId=&from=&to=` — returns all overlapping bookings for a given resource/window. Also supports user-level conflict check (can't be in two places at once). |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 3.16 | Availability viewer (time grid) | `scheduler/pages/availability-grid.tsx` — Visual grid showing available (green) / partially available (amber) / unavailable (red) time slots for a selected resource + date. Tooltip shows constraint reason when hovering unavailable cell. |
| 3.19 | Constraint configuration pages | `scheduler/pages/constraints-page.tsx` — List view of all constraints grouped by resource. Create/edit dialog: select resource, constraint type (training/consumable/staff), and value (competency name, consumable SKU, staff role). |
| 3.17 | Waitlist management page | `scheduler/pages/waitlist-page.tsx` — List waitlist entries for the user. Shows position, resource, date, status (waiting/promoted/expired). Toggle auto-promote preference. Cancel waitlist entry. |

**Sprint 2 Deliverables:** Availability engine, constraint evaluation system, waitlist CRUD, conflict detection API, availability time grid UI, constraint config pages, waitlist management page.

---

### Sprint 3 — Recurring, Costs & Details (Days 11–15)

**Theme:** Recurring booking rules, cost calculation, booking detail pages, list views.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 3.6 | Recurring booking rule engine | `RecurringRule` entity, `RecurringRuleService` | Fields: TenantId, ResourceId, UserId, CronExpression (daily/weekly/monthly/custom), EffectiveFrom, EffectiveTo, MaxInstances, DayOfWeek mask, TimeOfDay, DurationMinutes, Title, Purpose, Status. Hangfire recurring job runs nightly: reads active rules, generates next batch of bookings (up to 90 days forward), skips dates with existing bookings or blackouts. API: CRUD for rules, preview future instances. |
| 3.7 | Booking cost calculation | `IPricingService` | Calculate booking cost: `rate × duration × multiplier`. Rate comes from the resource's pricing model (Phase 5 — start with a simple configurable per-resource hourly rate stored in `BookingResources`). Optional discount for recurring/long-term. Returns cost breakdown to display in booking wizard. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 3.14 | Booking details page | `scheduler/pages/booking-details.tsx` — Full detail view: resource info, date/time, status badge, purpose/notes, cost breakdown, timeline of status changes. Action buttons: Edit, Cancel, Check-in (for admin). |
| 3.15 | Bookings List page with filters | `scheduler/pages/bookings-list.tsx` — TanStack Table with filters: date range, status, resource, user. Sortable columns. Export to CSV. Tabs: "My Bookings", "All Bookings" (admin). Row click → details page. |
| 3.18 | Recurring booking configuration dialog | `scheduler/pages/recurring-booking-dialog.tsx` — Dialog inside booking wizard or standalone. Options: frequency (daily/weekly/monthly/custom), day-of-week checkboxes, end date or max occurrences. Preview next 5 generated dates. |

**Sprint 3 Deliverables:** Recurring rule engine + Hangfire job, basic cost calculation, booking details page, bookings list with filters, recurring booking dialog.

---

### Sprint 4 — Calendar Sync, Trainer, Polish & Tests (Days 16–20)

**Theme:** Outlook/Google Calendar sync, trainer availability, integration tests, final integration.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 3.8 | Calendar sync (Outlook/Google) | `ICalendarSyncService` | Bi-directional sync: (a) **Outlook** via Microsoft Graph API — OAuth2 flow, create/update/delete events from bookings, import non-system events as blocked time. (b) **Google** via Google Calendar API — same pattern. `CalendarSyncLog` table tracks last sync timestamp, direction, status. Hangfire recurring job syncs every 15 min for connected users. Initial sync scope: ±30 days. |
| 3.9 | Trainer availability sync service | `ITrainerSyncService` | Sync trainer's personal calendar (Outlook/Google) into system as blocked/available time slots. Stores availability in `TrainerAvailability` table. Used by availability engine to mark trainer-unavailable slots. |
| 3.11 | Integration tests | xUnit + Testcontainers tests | Tests: Booking CRUD flow, double-booking rejection, availability query correctness, waitlist auto-promotion on cancel, recurring rule generation, conflict detection, cost calculation. Uses `SchedulingWebApplicationFactory` (similar pattern to `FacilityWebApplicationFactory`). |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 3.20 | Calendar sync settings page | `scheduler/pages/calendar-sync-settings.tsx` — OAuth connect buttons for Outlook and Google. Shows connection status, last sync time. Toggle auto-sync on/off. Disconnect button. |
| 3.21 | Trainer availability page | `scheduler/pages/trainer-availability.tsx` — Weekly grid view showing trainer's available/blocked time slots. Add/edit/remove blocked slots manually. Sync status indicator from connected calendar. |
| 3.22 | My Bookings page (for researchers) | `scheduler/pages/my-bookings.tsx` — Simplified list of current user's bookings. Quick filters: upcoming, past, cancelled. Action buttons: check-in QR code (if applicable), cancel, edit. Empty state with "Book Now" CTA. |

**Sprint 4 Deliverables:** Outlook/Google Calendar sync, trainer availability sync, integration tests, sync settings page, trainer availability UI, my bookings page.

---

## New Service Structure: `Services/Scheduling/`

```
backend/Services/Scheduling/
├── ResearchLms.Scheduling.Domain/
│   ├── Entities/
│   │   ├── Booking.cs
│   │   ├── BookingResource.cs           # Lightweight cache synced from Facility
│   │   ├── WaitlistEntry.cs
│   │   ├── RecurringRule.cs
│   │   ├── Constraint.cs
│   │   └── TrainerAvailability.cs
│   ├── Enums/
│   │   ├── BookingStatus.cs
│   │   ├── ResourceType.cs              # Shared or local
│   │   ├── ConstraintType.cs
│   │   └── SyncProvider.cs              # Outlook / Google
│   ├── ValueObjects/
│   │   ├── TimeSlot.cs
│   │   └── CostBreakdown.cs
│   └── Interfaces/
│       ├── IBookingRepository.cs
│       ├── IAvailabilityService.cs
│       ├── IConstraintEvaluationService.cs
│       ├── IWaitlistService.cs
│       ├── IRecurringRuleService.cs
│       ├── IPricingService.cs
│       ├── ICalendarSyncService.cs
│       └── ITrainerSyncService.cs
│
├── ResearchLms.Scheduling.Application/
│   ├── Commands/
│   │   ├── CreateBookingCommand.cs
│   │   ├── CancelBookingCommand.cs
│   │   ├── JoinWaitlistCommand.cs
│   │   ├── CreateRecurringRuleCommand.cs
│   │   └── SyncCalendarCommand.cs
│   ├── CommandHandlers/
│   ├── Queries/
│   │   ├── GetAvailabilityQuery.cs
│   │   ├── GetBookingByIdQuery.cs
│   │   ├── GetBookingsQuery.cs
│   │   ├── GetConflictsQuery.cs
│   │   ├── GetWaitlistQuery.cs
│   │   └── GetRecurringPreviewQuery.cs
│   ├── QueryHandlers/
│   ├── DTOs/
│   │   ├── BookingDto.cs
│   │   ├── BookingDetailDto.cs
│   │   ├── AvailabilityDto.cs
│   │   ├── WaitlistEntryDto.cs
│   │   ├── RecurringRuleDto.cs
│   │   └── ConflictDto.cs
│   ├── Validators/
│   │   ├── CreateBookingValidator.cs
│   │   ├── CancelBookingValidator.cs
│   │   ├── CreateRecurringRuleValidator.cs
│   │   └── JoinWaitlistValidator.cs
│   ├── EventHandlers/
│   │   ├── AssetCreatedConsumer.cs      # Updates BookingResources cache
│   │   └── AssetDecommissionedConsumer.cs
│   ├── Mappings/
│   │   └── BookingMapping.cs
│   └── DependencyInjection.cs
│
├── ResearchLms.Scheduling.Infrastructure/
│   ├── Persistence/
│   │   ├── SchedulingDbContext.cs
│   │   ├── EntityConfigurations/
│   │   │   ├── BookingConfiguration.cs
│   │   │   ├── WaitlistEntryConfiguration.cs
│   │   │   ├── RecurringRuleConfiguration.cs
│   │   │   ├── ConstraintConfiguration.cs
│   │   │   └── TrainerAvailabilityConfiguration.cs
│   │   ├── BookingRepository.cs
│   │   └── WaitlistRepository.cs
│   ├── Services/
│   │   ├── AvailabilityService.cs
│   │   ├── ConstraintEvaluationService.cs
│   │   ├── WaitlistService.cs
│   │   ├── RecurringRuleService.cs
│   │   ├── PricingService.cs
│   │   ├── CalendarSyncService.cs
│   │   ├── TrainerSyncService.cs
│   │   └── GraphAuthService.cs          # OAuth token management
│   ├── BackgroundJobs/
│   │   ├── RecurringBookingJob.cs        # Hangfire: nightly generation
│   │   ├── WaitlistPromotionJob.cs       # Hangfire: on cancellation
│   │   └── CalendarSyncJob.cs            # Hangfire: every 15 min
│   ├── EventConsumers/
│   │   └── SchedulingEventConsumer.cs
│   └── DependencyInjection.cs
│
└── ResearchLms.Scheduling.Api/
    ├── Controllers/
    │   ├── BookingsController.cs
    │   ├── AvailabilityController.cs
    │   ├── ConstraintsController.cs
    │   ├── WaitlistController.cs
    │   ├── RecurringRulesController.cs
    │   ├── ConflictsController.cs
    │   ├── CalendarSyncController.cs
    │   └── TrainerAvailabilityController.cs
    ├── Program.cs
    ├── Dockerfile
    └── appsettings.json
```

### Test Project

```
backend/tests/IntegrationTests/
├── SchedulingWebApplicationFactory.cs   # Uses WebApplicationFactory<SchedulingProgram>
└── SchedulingTests/
    ├── BookingCrudTests.cs
    ├── AvailabilityTests.cs
    ├── ConstraintTests.cs
    ├── WaitlistTests.cs
    ├── RecurringRuleTests.cs
    ├── ConflictDetectionTests.cs
    ├── CostCalculationTests.cs
    └── CalendarSyncTests.cs
```

---

## Frontend Module Structure (To Create)

```
frontend/src/modules/scheduler/
├── pages/
│   ├── scheduler-calendar.tsx
│   ├── create-booking-wizard.tsx
│   ├── booking-details.tsx
│   ├── bookings-list.tsx
│   ├── availability-grid.tsx
│   ├── waitlist-page.tsx
│   ├── recurring-booking-dialog.tsx
│   ├── constraints-page.tsx
│   ├── calendar-sync-settings.tsx
│   ├── trainer-availability.tsx
│   └── my-bookings.tsx
├── components/
│   ├── booking-status-badge.tsx
│   ├── time-slot-picker.tsx
│   ├── resource-selector.tsx
│   └── conflict-warning.tsx
├── __tests__/
│   ├── scheduler-calendar.test.tsx
│   ├── create-booking-wizard.test.tsx
│   └── availability-grid.test.tsx
└── index.ts                              # Barrel exports
```

---

## API Routes

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| GET | `/api/v1/scheduling/bookings` | Bookings | List (paginated, filterable) |
| GET | `/api/v1/scheduling/bookings/{id}` | Bookings | Get by ID |
| POST | `/api/v1/scheduling/bookings` | Bookings | Create |
| PUT | `/api/v1/scheduling/bookings/{id}` | Bookings | Update |
| PATCH | `/api/v1/scheduling/bookings/{id}/cancel` | Bookings | Cancel |
| GET | `/api/v1/scheduling/availability?resourceId=&date=` | Availability | Get available slots |
| GET | `/api/v1/scheduling/conflicts?resourceId=&from=&to=` | Conflicts | Detect overlaps |
| GET | `/api/v1/scheduling/waitlist` | Waitlist | List my entries |
| POST | `/api/v1/scheduling/waitlist` | Waitlist | Join waitlist |
| DELETE | `/api/v1/scheduling/waitlist/{id}` | Waitlist | Leave waitlist |
| GET | `/api/v1/scheduling/recurring-rules` | RecurringRules | List rules |
| POST | `/api/v1/scheduling/recurring-rules` | RecurringRules | Create rule |
| PUT | `/api/v1/scheduling/recurring-rules/{id}` | RecurringRules | Update rule |
| DELETE | `/api/v1/scheduling/recurring-rules/{id}` | RecurringRules | Delete rule |
| GET | `/api/v1/scheduling/recurring-rules/{id}/preview` | RecurringRules | Preview instances |
| GET | `/api/v1/scheduling/constraints` | Constraints | List constraints |
| POST | `/api/v1/scheduling/constraints` | Constraints | Create constraint |
| DELETE | `/api/v1/scheduling/constraints/{id}` | Constraints | Delete constraint |
| GET | `/api/v1/scheduling/trainer-availability` | TrainerAvailability | Get trainer schedule |
| PUT | `/api/v1/scheduling/trainer-availability` | TrainerAvailability | Update availability |
| POST | `/api/v1/scheduling/calendar-sync/outlook` | CalendarSync | Connect Outlook |
| POST | `/api/v1/scheduling/calendar-sync/google` | CalendarSync | Connect Google |
| GET | `/api/v1/scheduling/calendar-sync/status` | CalendarSync | Sync status |
| POST | `/api/v1/scheduling/calendar-sync/sync` | CalendarSync | Trigger manual sync |

---

## DB Schema (New Tables)

| Table | Key Columns | Notes |
|-------|------------|-------|
| `Bookings` | TenantId, ResourceId, ResourceType, UserId, StartTime, EndTime, Status, Purpose, Notes, Cost, CreatedAt, UpdatedAt | Tenant + ResourceId + StartTime index |
| `BookingResources` | TenantId, ResourceId, ResourceType, Name, Identifier, HourlyRate, IsActive | Cached from Facility via MassTransit |
| `Constraints` | TenantId, ResourceId, ResourceType, Type (Training/Consumable/Staff), Value, Description | Per-resource constraint rules |
| `WaitlistEntries` | TenantId, ResourceId, ResourceType, Date, StartTime, EndTime, UserId, Priority, Status, ExpiresAt | FIFO order by CreatedAt |
| `RecurringRules` | TenantId, ResourceId, UserId, CronExpression, EffectiveFrom, EffectiveTo, MaxInstances, TimeOfDay, Duration, Title, Status | Next-run computation |
| `TrainerAvailability` | TenantId, UserId, DayOfWeek, StartTime, EndTime, IsAvailable, Source (Manual/Synced) | Weekly recurring availability |
| `CalendarSyncLog` | TenantId, UserId, Provider (Outlook/Google), LastSyncAt, Direction, Status, ErrorMessage | Audit trail for sync |

---

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Calendar sync needs Outlook/Google OAuth app registration | Medium | Provide detailed setup guide in README. Support manual time-blocking as fallback. |
| Recurring booking generation could create too many rows | Low | Cap at 90 days forward and 100 instances per rule. Admin can adjust. |
| Constraint evaluation depends on Facility module data (training, inventory) | Medium | Publish training completion and inventory stock events via MassTransit. Constraint service subscribes and caches locally. |
| Waitlist auto-promotion needs real-time (24hr expiry window) | Low | Hangfire job runs every 15 min. Notification via existing `INotificationService`. |
| Availability engine performance with many resources | Medium | Redis cache with 5-min TTL for availability queries. Invalidate on booking create/cancel. |
| No `scheduler/` frontend module folder exists yet | Low | Create during Sprint 1. Follow existing `facilities/` module patterns. |

---

## Phase 2 → Phase 3 Handoff Checklist

- [x] Facility module complete (assets, instruments, maintenance, custody)
- [x] Multi-tenant middleware + global query filters
- [x] MassTransit + RabbitMQ event bus running
- [x] Hangfire background job infrastructure
- [x] Redis cache service available
- [x] Elasticsearch running (for future search indexing of bookings)
- [ ] New `Services/Scheduling/` solution folder created
- [ ] New `SchedulingDbContext` registered in DI
- [ ] Scheduling DB connection string in `appsettings.json`
- [ ] Scheduling service added to Docker Compose
- [ ] Scheduling cluster added to Gateway routing
- [ ] Frontend `modules/scheduler/` folder created
- [ ] Scheduling routes added to `App.tsx`
- [ ] Scheduling permission strings added to seed data
