# Phase 7 — Communication, Training & Notifications: Sprint Plan

**Timeline:** Weeks 20–24 (5 weeks @ 5 days = 25 working days)
**Status:** Greenfield — no existing Training, Notifications, or Help code
**Dependency on Phase 6:** Analytics & BI dashboards, reports, and aggregation jobs are complete. Phase 5 Billing (invoices, pricing, ERP), Compliance, and all prior phases operational. Shared infrastructure (multi-tenancy, MediatR, FluentValidation, Serilog, MassTransit, Hangfire, SignalR, Docker Compose, YARP Gateway) already in place.

---

## Architecture Decisions

### Service Boundary
Phase 7 introduces three new microservices under `Services/`:

| Microservice | Modules | Rationale |
|-------------|---------|-----------|
| `Services/Training/` | Competencies, prerequisites, booking gating | Training lifecycle is distinct — expiry alerts, renewal workflows |
| `Services/Communications/` | Notifications (email/SMS/Teams/SignalR), templates, preferences, announcements | Message delivery is cross-cutting; isolated avoids coupling to any domain |
| `Services/Content/` | Help articles, walkthroughs/onboarding, publications, facility homepage builder | Static/content-heavy with separate storage and caching needs |

### Database Strategy
- `TrainingDb` — `Competencies`, `UserCompetencies`, `PrerequisiteRules`, `CompetencyRenewals`
- `CommunicationsDb` — `Notifications`, `NotificationTemplates`, `NotificationPreferences`, `Announcements`
- `ContentDb` — `HelpArticles`, `HelpCategories`, `Walkthroughs`, `WalkthroughSteps`, `Publications`, `HomepageDefinitions`

### Notification Patterns
```
Service A → INotificationService.SendAsync(notification)
                ↓
        NotificationDispatcher
            ↓           ↓           ↓           ↓
      IEmailService  ISmsService  TeamsWebhook  SignalRHub
            ↓           ↓           ↓           ↓
        SMTP/SendGrid  Twilio   Teams API    User's browser
```
- `INotificationService` (in BuildingBlocks) is a unified facade
- Each transport is pluggable via DI
- Delivery is async — Hangfire retries on failure
- Users set channel preferences per notification type

### Booking Gating
```
User attempts booking → IPrerequisiteService.Validate(userId, instrumentId)
                              ↓
              Checks: competency valid? → yes → allow booking
                      competency expired? → block + suggest renewal
                      no competency? → block + show training options
```
- Gating runs during booking creation (in Scheduling service) via MassTransit request/response
- `IPrerequisiteService` lives in Training, called by Scheduling over the event bus

### SignalR Real-Time Architecture
```
ASP.NET Core SignalR Hub (in Communications API)
    ↓
Clients: web app, mobile apps
    ↓
Event sources: any microservice publishes INotificationReceivedEvent via MassTransit
    ↓
NotificationConsumer → dispatches to SignalR hub → pushes to connected clients
```
- Single hub: `/hubs/notifications`
- User-scoped groups for targeted delivery
- Offline users receive notifications on next connect (stored in DB)

---

## Scope Summary

| Area | Backend Tasks | Frontend Tasks | DB Tables | Est. Effort |
|------|:-------------:|:--------------:|-----------|:-----------:|
| Training & Competencies | 7.1, 7.2, 7.3 | 7.16, 7.17, 7.18 | `Competencies`, `UserCompetencies`, `PrerequisiteRules` | 9 days |
| Announcements | 7.4 | 7.19 | `Announcements` | 2 days |
| Facility Homepage Builder | 7.5 | 7.20 | `HomepageDefinitions` | 5 days |
| Publications | 7.6 | 7.21 | `Publications` | 3 days |
| Notification Engine | 7.7, 7.8, 7.9, 7.10 | 7.22, 7.23, 7.24 | `Notifications`, `NotificationTemplates`, `NotificationPreferences` | 10 days |
| In-App Notifications (SignalR) | 7.11, 7.12 | 7.22, 7.23 | Part of CommunicationsDb | 5 days |
| Help & Support | 7.13, 7.14 | 7.25, 7.26 | `HelpArticles`, `Walkthroughs`, `WalkthroughSteps` | 7 days |
| Integration Tests | 7.15 | — | — | 2 days |
| **Total** | **15 backend** | **11 frontend** | **~15 tables** | **~43 days** |

---

## Sprint Breakdown

---

### Sprint 1 — Training & Competencies (Week 20, Days 1–5)

**Theme:** Competency definitions, prerequisite rules, booking gating engine, expiry management.

#### Backend Tasks — `Services/Training/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 7.1 | Training module — competencies + prerequisites | `Competencies` table, `UserCompetencies` table | **Competencies** fields: TenantId, Name, Description, Category (Safety/Technical/Operational), ValidityPeriodDays, RequiresRenewal, CreatedAt. **UserCompetencies** fields: TenantId, UserId, CompetencyId, AchievedAt, ExpiresAt, Status (Active/Expired/Revoked), RenewedAt, CreatedAt. **PrerequisiteRules** fields: TenantId, InstrumentId (nullable — applies globally or per-instrument), CompetencyId, MinLevel (optional). Configuration maps to `CompetencyConfigurations`. |
| 7.2 | Booking gating engine | `IPrerequisiteService` | Interface: `Task<PrerequisiteResult> ValidateAsync(Guid userId, Guid? instrumentId, CancellationToken ct)`. Returns list of unmet prerequisites with competency name, expiry date, suggested actions. Called by Scheduling service via MassTransit request/response pattern. If Scheduling is unavailable, gating still runs — consumer handles timeout with allow-booking-fallback config. |
| 7.3 | Competency expiry management + renewal workflow | Hangfire recurring job | `CompetencyExpiryJob` runs daily: finds all UserCompetencies expiring within 30 days, sends notification (via `INotificationService`) to user + manager. Marks Status=Expired when past ExpiresAt. Records renewal via `UserCompetencyRenewal` table (audit trail). Configurable threshold days in appsettings. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 7.16 | Training dashboard | `TrainingDashboard.tsx` — Route: `/training`. Competency overview cards (Active, Expiring Soon, Expired). Calendar of upcoming renewals. Quick-add competency assignment. Search/filter by category. Bar chart of competencies by status. |
| 7.17 | Competency matrix page | `CompetencyMatrix.tsx` — Route: `/training/matrix`. Grid: users as rows, competencies as columns, cells colored by status (green=Active, yellow=Expiring, red=Expired). Click cell → assign/revoke/renew dialog. Filter by department, role. Export to CSV. |
| 7.18 | Prerequisite warning component | `PrerequisiteCheck.tsx` — Reusable component shown in booking flow. When user selects an instrument, calls prerequisite API. Displays inline warning if prerequisites are unmet: "You need [Competency Name] (expires [date]) to book this instrument." Link to training dashboard. Blocks booking submission if any prerequisite is unmet. |

**Sprint 1 Deliverables:** `Competencies`, `UserCompetencies`, `PrerequisiteRules` tables, `IPrerequisiteService` with MassTransit integration, `CompetencyExpiryJob` Hangfire job, TrainingDashboard, CompetencyMatrix, PrerequisiteCheck component.

---

### Sprint 2 — Notifications & Announcements (Week 21, Days 6–10)

**Theme:** Multi-channel notification delivery (email/SMS/Teams), SignalR real-time, announcement CRUD, notification preferences.

#### Backend Tasks — `Services/Communications/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 7.7 | Notification templates system | `NotificationTemplates` table | **NotificationTemplates** fields: TenantId, Name, Channel (Email/Sms/Teams), Subject (with {{placeholder}} support), Body (markdown/HTML), IsDefault, CreatedAt. Template resolution: by notification type + channel, fallback to default. Pre-seeded templates for common types (competency expiry, booking confirmation, invoice paid, etc.). |
| 7.8 | Email delivery service | SMTP + SendGrid implementation | `IEmailService` (fills interface from BuildingBlocks). SMTP implementation: configurable host/port/SSL via appsettings. SendGrid implementation: API key via appsettings. Auto-detection (prefer SendGrid if API key present, fallback to SMTP). Supports HTML body, attachments (from byte[]), CC/BCC. Rate limiting (max 10 emails/sec via SemaphoreSlim). |
| 7.9 | SMS delivery service | Twilio implementation | `ISmsService` — Interface: `Task SendAsync(string to, string body, CancellationToken ct)`. Twilio implementation via `Twilio` NuGet package. Configurable from-number in appsettings. Supports Unicode for Arabic messages. |
| 7.10 | Teams webhook notification | `ITeamsNotificationService` | Interface: `Task SendAsync(string webhookUrl, string title, string message, MessageCardColor color, CancellationToken ct)`. Sends adaptive cards via incoming webhook. Configurable timeout. Retry on 429 rate limit. |
| 7.11 | In-app notification system | SignalR hub + `INotificationService` | **Notifications** table: TenantId, UserId, Type, Title, Body, Link (optional navigation URL), IsRead, CreatedAt. `INotificationService` (unified facade): dispatches to appropriate channel based on user preferences + notification type. Publishes `MassTransit` event for cross-service send. `NotificationConsumer` — writes to DB + pushes via SignalR hub (`/hubs/notifications`). Supports bulk (group notifications). |
| 7.12 | Notification preference management | `NotificationPreferences` table | **NotificationPreferences** fields: TenantId, UserId, NotificationType (CompetencyExpiry/BookingReminder/InvoicePaid/etc.), Channels (JSON array: Email/Sms/Teams/InApp), IsOptedOut. CRUD API: `GET/PUT /api/v1/notifications/preferences`. Default preferences seeded on user creation (all channels enabled). |
| 7.4 | Announcements CRUD API | `AnnouncementsController` | **Announcements** fields: TenantId, Title, Body (rich text/markdown), Priority (Low/Normal/High/Urgent), TargetAudience (All/Training/Finance/Operations — or null for all), ValidFrom, ValidTo, CreatedByUserId, CreatedAt, UpdatedAt. API: `GET/POST/PUT/DELETE /api/v1/announcements`. Filter by date range, priority, audience. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 7.22 | Notification Center | `NotificationCenter.tsx` — Route: `/notifications`. Bell icon in header with unread badge count (updated via SignalR). Dropdown panel shows last 10 notifications (mark as read, click navigates to link). Full-page view with filters (All/Unread, by type, date range). Mark-all-read action. Real-time push via SignalR connection. |
| 7.23 | Notification preference settings | `NotificationPreferences.tsx` — Route: `/settings/notifications`. Per notification-type toggle matrix: rows = types (Competency Expiry, Booking Reminder, Invoice Paid, etc.), columns = channels (Email, SMS, Teams, In-App). Checkbox per cell. Global opt-out toggle. Save button. |
| 7.24 | Email/SMS template editor | `EmailTemplateEditor.tsx`, `SmsTemplateEditor.tsx` — Route: `/admin/notifications/templates`. List of templates with name, channel, last modified. Edit: subject, body (with placeholder helper sidebar showing available {{variables}}). Preview pane (renders template with sample data). Test send button (sends to your email/SMS). |
| 7.19 | Announcements list + create page | `AnnouncementsList.tsx`, `CreateAnnouncement.tsx` — Route: `/announcements`. List with priority badges, date range, target audience. Create/edit form: rich text editor (tiptap or similar), priority selector, date-range picker, audience multi-select. Active/inactive banner on home page. |

**Sprint 2 Deliverables:** `CommunicationsDb` tables (Notifications, Templates, Preferences, Announcements), `IEmailService` (SMTP + SendGrid), `ISmsService` (Twilio), `ITeamsNotificationService`, SignalR hub, `INotificationService` dispatcher, NotificationCenter with real-time updates, NotificationPreferences page, template editors, Announcements CRUD.

---

### Sprint 3 — Help & Support, Walkthroughs (Week 22, Days 11–15)

**Theme:** Help article management, searchable knowledge base, interactive walkthrough/onboarding system.

#### Backend Tasks — `Services/Content/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 7.13 | Help content management | `HelpArticles` table, CRUD API | **HelpArticles** fields: TenantId, Title, Slug, Content (markdown), CategoryId, Tags (JSON array), IsPublished, ViewCount, CreatedByUserId, CreatedAt, UpdatedAt. **HelpCategories** fields: TenantId, Name, Slug, SortOrder, ParentCategoryId (self-referencing for hierarchy). API: `GET /api/v1/help/articles` (search by title/tag, filter by category), `GET /api/v1/help/articles/{slug}`, `POST/PUT/DELETE /api/v1/admin/help/articles`. Full-text search via Elasticsearch index (reuse `ISearchService` from BuildingBlocks). Cache popular articles in `IMemoryCache` (TTL 30 min). |
| 7.14 | Walkthrough/onboarding system | `Walkthroughs` table, step engine | **Walkthroughs** fields: TenantId, Name, TargetRoute (the page URL where this walkthrough starts), Trigger (Manual/FirstVisit/RoleBased), Priority, IsActive. **WalkthroughSteps** fields: WalkthroughId, StepOrder, Title, Content (markdown), ElementSelector (CSS selector for target element), Placement (Top/Bottom/Left/Right), ActionType (Click/Input/Wait). API: `GET /api/v1/walkthroughs/active?route=/some-page` — returns active walkthroughs for the current user. `POST /api/v1/walkthroughs/{id}/complete` — marks as completed (stored in `UserWalkthroughProgress`). Skip/complete tracking per user. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 7.25 | Help & Support center | `HelpCenter.tsx` — Route: `/help`. Category sidebar tree (expandable). Search bar at top (searches Elasticsearch — instant results). Article list per category with view count. Article detail page: renders markdown content, table of contents (auto-generated from headings), breadcrumbs, previous/next article navigation. Feedback buttons (helpful/not helpful). Related articles (by tags). Link to create support ticket. |
| 7.26 | Interactive walkthrough component | `Walkthrough.tsx` — Overlay component. Lightbox-style: highlights target element via CSS selector, shows tooltip with step title + content + previous/next/skip buttons. Progress indicator (step 3 of 7). Dismissible (click overlay or press Escape). Resumes from last incomplete step when user navigates to the route. Admin preview mode to test walkthrough flows. Triggered by `Trigger` config: auto-shows on first visit or role-based or via Help menu. |

**Sprint 3 Deliverables:** `ContentDb` tables (HelpArticles, HelpCategories, Walkthroughs, WalkthroughSteps, UserWalkthroughProgress), Help articles CRUD + search API, Walkthrough engine API, HelpCenter page with search + categories, Walkthrough overlay component.

---

### Sprint 4 — Homepage Builder, Publications & Integration Tests (Week 23, Days 16–20)

**Theme:** Facility homepage drag-and-drop builder, publication tracking, integration tests across all Phase 7 modules.

#### Backend Tasks — `Services/Content/` (continued)

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 7.5 | Facility homepage builder | `HomepageDefinitions` table, CRUD API | **HomepageDefinitions** fields: TenantId, Name, IsActive, Layout (nvarchar(max) — JSON: `{sections: [{type: Announcements, position: 1, config: {}}, {type: KpiCard, position: 2, config: {metric: Revenue}}, {type: QuickActions, position: 3}, {type: UpcomingBookings, position: 4}, {type: RecentActivity, position: 5}, {type: CustomMarkdown, config: {content: "..."}}]}`), CreatedAt, UpdatedAt. API: `GET /api/v1/homepage` (returns active homepage for tenant), `PUT /api/v1/homepage` (upsert layout). Multiple tenants can have different homepages. Fallback to default layout if none defined. |
| 7.6 | Publications tracking | `Publications` table, CRUD API | **Publications** fields: TenantId, Title, Authors (JSON array), Journal, DOI, PMID, PublicationDate, Type (Research Paper/Conference/Poster/Thesis), Link, Abstract, Attachments (JSON — file references), IsVerified, CreatedByUserId, CreatedAt. API: `GET/POST/PUT/DELETE /api/v1/publications`. Search by title, author, year. Link publications to instruments/equipment via `PublicationInstrumentLinks` table. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 7.20 | Facility homepage builder | `HomepageBuilder.tsx` — Route: `/admin/homepage`. Drag-and-drop section builder. Available section types (palette on left): Announcements Banner, KPI Cards, Quick Actions, Upcoming Bookings, Recent Activity, Custom Markdown, Training Alerts. Drop onto canvas (right). Reorder by drag. Configure each section (e.g., which KPI metric, markdown content). Preview toggle. Save/activate. |
| 7.21 | Publications tracking page | `PublicationsList.tsx`, `AddPublication.tsx` — Route: `/publications`. List with filters: year, type, journal, author search. Card view: title, authors, journal, year, DOI link. Detail page: full metadata, abstract, linked instruments, attached files. Create/edit form: search-by-DOI auto-fill (CrossRef API), manual entry fallback, file upload for PDF. Link to instruments via search dropdown. |

#### Operations Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| — | EF Core migrations for new services | Migrations | `dotnet ef migrations add Training_Initial --project Services/Training/...`, `Communications_Initial`, `Content_Initial` |
| — | Frontend routing + sidebar updates | Route + nav update | Add sidebar sections: Training, Announcements, Publications, Help, Notifications. Route definitions in `App.tsx`. |

#### Integration Tests

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 7.15 | Integration tests (all Phase 7 modules) | xUnit + Testcontainers | **TrainingWebApplicationFactory** + test classes. `TrainingCrudTests` — create/update/delete competencies, assign user competencies, expiry calculation. `PrerequisiteGatingTests` — validate prerequisites block/allows booking, expired competency behavior. `NotificationDeliveryTests` — email/SMS/Teams send mock, template resolution, preference filtering. `SignalRTests` — notification push received by correct user group. `AnnouncementTests` — CRUD, audience filtering, date-range activation. `HelpArticleTests` — CRUD, search, caching. `WalkthroughTests` — active walkthrough resolution, completion tracking. `HomepageTests` — layout CRUD, fallback to default. `PublicationTests` — CRUD, DOI auto-fill, instrument linking. |

**Sprint 4 Deliverables:** Facility homepage builder with drag-and-drop sections, Publications tracking with DOI auto-fill, EF Core migrations for 3 new databases, frontend routing + sidebar updates, integration tests (9 test classes).

---

## New / Extended Entity Structures

### New `Services/Training/ResearchLms.Training.Domain/`

```
├── Entities/
│   ├── Competency.cs
│   └── UserCompetency.cs
│   └── PrerequisiteRule.cs
├── Enums/
│   ├── CompetencyCategory.cs        (Safety, Technical, Operational)
│   └── CompetencyStatus.cs          (Active, Expired, Revoked)
├── ValueObjects/
│   └── PrerequisiteResult.cs        (IsAllowed, List<UnmetPrerequisite>)
└── Interfaces/
    ├── ICompetencyRepository.cs
    └── IPrerequisiteService.cs
```

### New `Services/Communications/ResearchLms.Communications.Domain/`

```
├── Entities/
│   ├── Notification.cs
│   ├── NotificationTemplate.cs
│   └── NotificationPreference.cs
│   └── Announcement.cs
├── Enums/
│   ├── NotificationChannel.cs       (Email, Sms, Teams, InApp)
│   └── NotificationType.cs          (CompetencyExpiry, BookingReminder, InvoicePaid, ...)
├── ValueObjects/
│   └── NotificationMessage.cs       (Title, Body, Channel, Recipients, Attachments)
└── Interfaces/
    ├── INotificationService.cs
    ├── IEmailService.cs
    ├── ISmsService.cs
    └── ITeamsNotificationService.cs
```

### New `Services/Content/ResearchLms.Content.Domain/`

```
├── Entities/
│   ├── HelpArticle.cs
│   ├── HelpCategory.cs
│   ├── Walkthrough.cs
│   ├── WalkthroughStep.cs
│   ├── Publication.cs
│   └── HomepageDefinition.cs
├── ValueObjects/
│   └── HomepageSection.cs
└── Interfaces/
    ├── IHelpArticleRepository.cs
    ├── IWalkthroughService.cs
    ├── IPublicationRepository.cs
    └── IHomepageRepository.cs
```

---

## Frontend Module Structure (New)

```
frontend/src/modules/
├── training/
│   ├── pages/
│   │   ├── TrainingDashboard.tsx
│   │   └── CompetencyMatrix.tsx
│   └── components/
│       └── PrerequisiteCheck.tsx
├── announcements/
│   ├── pages/
│   │   ├── AnnouncementsList.tsx
│   │   └── CreateAnnouncement.tsx
│   └── components/
│       └── AnnouncementBanner.tsx
├── notifications/
│   ├── pages/
│   │   ├── NotificationCenter.tsx
│   │   └── NotificationPreferences.tsx
│   ├── components/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationDropdown.tsx
│   └── hooks/
│       └── useSignalR.ts
├── help/
│   ├── pages/
│   │   ├── HelpCenter.tsx
│   │   └── HelpArticleDetail.tsx
│   └── components/
│       └── Walkthrough.tsx
├── publications/
│   ├── pages/
│   │   ├── PublicationsList.tsx
│   │   └── AddPublication.tsx
│   └── components/
│       └── PublicationCard.tsx
└── admin/
    ├── pages/
    │   └── HomepageBuilder.tsx
    └── components/
        ├── HomepageSectionPicker.tsx
        ├── HomepageSectionConfig.tsx
        ├── EmailTemplateEditor.tsx
        └── SmsTemplateEditor.tsx
```

---

## API Routes (New)

### Training — `/api/v1/training`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/competencies` | List competencies |
| POST | `/competencies` | Create competency |
| PUT | `/competencies/{id}` | Update competency |
| DELETE | `/competencies/{id}` | Delete competency |
| GET | `/user-competencies` | List user competency assignments |
| POST | `/user-competencies` | Assign competency to user |
| PUT | `/user-competencies/{id}` | Update assignment |
| POST | `/user-competencies/{id}/renew` | Renew competency |
| GET | `/prerequisite-rules` | List prerequisite rules |
| POST | `/prerequisite-rules` | Create rule |
| PUT | `/prerequisite-rules/{id}` | Update rule |
| DELETE | `/prerequisite-rules/{id}` | Delete rule |
| POST | `/prerequisites/validate` | Validate user prerequisites for instrument |

### Communications — `/api/v1/communications`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notifications` | List user notifications (paginated) |
| PUT | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/read-all` | Mark all as read |
| GET | `/notifications/unread-count` | Unread badge count |
| GET | `/notifications/preferences` | Get user notification preferences |
| PUT | `/notifications/preferences` | Update preferences |
| GET | `/notifications/templates` | List notification templates |
| PUT | `/notifications/templates/{id}` | Update template |
| POST | `/notifications/templates/{id}/test` | Send test notification |
| GET | `/announcements` | List announcements |
| POST | `/announcements` | Create announcement |
| PUT | `/announcements/{id}` | Update announcement |
| DELETE | `/announcements/{id}` | Delete announcement |

### Content — `/api/v1/content`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/help/articles` | List/search help articles |
| GET | `/help/articles/{slug}` | Get article by slug |
| POST | `/admin/help/articles` | Create article |
| PUT | `/admin/help/articles/{id}` | Update article |
| DELETE | `/admin/help/articles/{id}` | Delete article |
| GET | `/help/categories` | List help categories |
| GET | `/walkthroughs/active` | Get active walkthroughs for current route |
| POST | `/walkthroughs/{id}/complete` | Mark walkthrough step complete |
| GET | `/publications` | List publications |
| POST | `/publications` | Create publication |
| PUT | `/publications/{id}` | Update publication |
| DELETE | `/publications/{id}` | Delete publication |
| GET | `/publications/search-doi` | Auto-fill from DOI (CrossRef API) |
| GET | `/homepage` | Get active homepage layout |
| PUT | `/homepage` | Save homepage layout |

---

## DB Schema (New Tables — 3 New Databases)

### TrainingDb

| Table | Key Columns | Notes |
|-------|------------|-------|
| `Competencies` | TenantId, Name, Description, Category, ValidityPeriodDays, RequiresRenewal | Competency definitions |
| `UserCompetencies` | TenantId, UserId, CompetencyId (FK), AchievedAt, ExpiresAt, Status, RenewedAt | User-assigned competencies |
| `PrerequisiteRules` | TenantId, InstrumentId (nullable), CompetencyId (FK), MinLevel | Booking gating rules |

### CommunicationsDb

| Table | Key Columns | Notes |
|-------|------------|-------|
| `Notifications` | TenantId, UserId, Type, Title, Body, Link, IsRead, CreatedAt | In-app notification history |
| `NotificationTemplates` | TenantId, Name, Channel, Subject, Body, IsDefault | Multi-channel templates |
| `NotificationPreferences` | TenantId, UserId, Type, Channels (JSON), IsOptedOut | Per-user channel preferences |
| `Announcements` | TenantId, Title, Body, Priority, TargetAudience, ValidFrom, ValidTo | System announcements |

### ContentDb

| Table | Key Columns | Notes |
|-------|------------|-------|
| `HelpArticles` | TenantId, Title, Slug, Content, CategoryId, Tags (JSON), IsPublished, ViewCount | Knowledge base articles |
| `HelpCategories` | TenantId, Name, Slug, SortOrder, ParentCategoryId | Category hierarchy |
| `Walkthroughs` | TenantId, Name, TargetRoute, Trigger, Priority, IsActive | Onboarding flows |
| `WalkthroughSteps` | WalkthroughId (FK), StepOrder, Title, Content, ElementSelector, Placement, ActionType | Steps per walkthrough |
| `Publications` | TenantId, Title, Authors (JSON), Journal, DOI, PMID, PublicationDate, Type | Research publication records |
| `HomepageDefinitions` | TenantId, Name, IsActive, Layout (JSON) | Facility homepage config |

---

## MassTransit Events (New)

| Event | Publisher | Consumer(s) | Purpose |
|-------|-----------|-------------|---------|
| `CompetencyExpiredEvent` | Training (Hangfire job) | Communications | Triggers notification to user + manager |
| `PrerequisiteCheckRequest` | Scheduling | Training | Request/response — validates booking prerequisites |
| `SendNotificationCommand` | Any service | Communications | Triggers multi-channel notification delivery |
| `UserCreatedEvent` | Identity | Communications | Seeds default notification preferences |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Training prerequisites block legitimate bookings | High | Admin bypass toggle in config. Override permission for facility managers. |
| SignalR connection limits with many concurrent users | Medium | Scale out SignalR with Azure SignalR Service or Redis backplane. Configure max connections per server. |
| Email/SMS delivery failures (SMTP down, Twilio error) | Medium | Hangfire retry with exponential backoff (max 3 retries). Dead-letter queue for manual retry. |
| Help article search performance with large corpus | Low | Elasticsearch handles full-text search. Cache popular articles. |
| Walkthrough element selectors break on UI changes | Medium | Walkthrough admin preview mode. Versioned walkthroughs tied to frontend build. |

---

## Phase 6 → Phase 7 Handoff Checklist

- [x] Phase 6 modules complete: Dashboards, Widgets, Reports, Instrument 365
- [x] BillingDbContext + all Phase 6 entities registered
- [x] Integration test infrastructure (`BillingWebApplicationFactory`) operational
- [x] Shared infrastructure (Hangfire, MassTransit, SignalR, Redis) operational
- [x] Frontend `modules/billing/` with all Phase 6 pages/components in place
- [x] New microservices scaffolded: `Training`, `Communications`, `Content`
- [x] New entities defined: Competencies, UserCompetencies, PrerequisiteRules, Notifications, Templates, Preferences, Announcements, HelpArticles, HelpCategories, Walkthroughs, WalkthroughSteps, Publications, HomepageDefinitions
- [ ] EF Core migrations for 3 new databases generated
- [ ] `IPrerequisiteService` + MassTransit integration ready
- [ ] `IEmailService` (SMTP + SendGrid) registered in DI
- [ ] `ISmsService` (Twilio) registered in DI
- [ ] `ITeamsNotificationService` registered in DI
- [ ] SignalR hub `/hubs/notifications` configured
- [ ] `INotificationService` dispatcher registered in DI
- [ ] Hangfire jobs registered (CompetencyExpiry, NotificationRetry)
- [x] Elasticsearch indexing for help articles (NDJSON format, wired into Create/Update/Delete handlers)
- [x] Frontend modules scaffolded: training, announcements, notifications, help, publications, admin
- [x] New routes added to `App.tsx` and sidebar navigation
- [x] Integration tests for Content module (Homepage, Publication, HelpArticle, Walkthrough)
- [x] DOI auto-fill endpoint (CrossRef API integration)
- [x] DOI auto-fill button + instrument linking UI in AddPublication
- [x] EF Core migration for ContentDb (Content_Initial)
