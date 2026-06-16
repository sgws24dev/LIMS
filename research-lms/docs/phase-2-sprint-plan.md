# Phase 2 — Facility & Equipment Management: Sprint Plan

**Timeline:** Weeks 5–9 (4 weeks @ 5 days = 20 working days)  
**Status:** Greenfield — no existing code for any Phase 2 items  
**Dependency on Phase 1:** Solution structure, Clean Architecture template, DbContext, multi-tenancy, RBAC, Gateway routing, Docker Compose, shared infrastructure — all in place.

---

## Scope Summary

| Area | Backend Tasks | Frontend Tasks | DB Tables | Est. Effort |
|------|:-------------:|:--------------:|-----------|:-----------:|
| Facility & Room Management | 2.1, 2.2, 2.12 | 2.17, 2.18, 2.19, 2.30 | `Facilities`, `Rooms` | 9 days |
| Asset Register & Lifecycle | 2.3, 2.4, 2.5, 2.6, 2.15 | 2.20, 2.21, 2.22 | `Assets` (temporal), `Instruments`, `InstrumentConfigs` | 14 days |
| Maintenance & Calibration | 2.7, 2.10, 2.11, 2.14 | 2.23, 2.25, 2.26, 2.27, 2.28, 2.29 | `MaintenanceRecords`, `WorkOrders`, `CalibrationRecords` | 14 days |
| Custody, QR, Telemetry, Search | 2.8, 2.9, 2.13, 2.16 | 2.24, 2.31, 2.32 | `CustodyEvents`, `TelemetryRecords` | 9 days |
| **Total** | **16 backend** | **16 frontend** | **10 tables** | **~46 days** |

---

## Architecture Decisions

### Service Boundary
All Phase 2 entities live in a single **Facility microservice** under `Services/Facility/` following Clean Architecture (Domain, Application, Infrastructure, Api). This keeps early cohesion (asset ↔ instrument ↔ maintenance ↔ custody) without cross-service calls. If scale demands, `maintenance` or `telemetry` can be split later via event-driven extraction.

### Entity Inheritance Strategy
- **`Asset`** is the base entity (TPH-discriminated). `Instrument` is a derived type extending Asset.
- Discriminator column: `AssetType` (`"Instrument"`, `"Equipment"`, `"Vehicle"`, `"Room"`).
- This enables a single `Assets` table with a unified search API while allowing Instrument-specific columns.

### Entity Placement
- Domain entities live in `ResearchLms.Facility.Domain/Entities/` (not Shared), keeping the Facility module self-contained.
- Entity configurations live alongside in `Facility.Infrastructure/Persistence/EntityConfigurations/`.
- The shared `ResearchLmsDbContext` in Infrastructure will be extended with Facility DbSets.

### Multi-Tenancy
- All Facility entities inherit `BaseEntity` and use the existing `ITenantContext` + global query filter pattern.

### Temporal Tables (Task 2.14)
- Applied only to the `Assets` table via EF Core temporal table support (`UseTemporalTable`).
- Provides automatic history of all asset changes for audit/compliance without custom code.

### Elasticsearch Indexing (Task 2.15)
- Reuse `ElasticsearchService` from Infrastructure layer.
- Index assets on create/update via MassTransit event consumer (`AssetCreatedEvent`, `AssetUpdatedEvent`).

---

## Sprint Breakdown

---

### Sprint 1 — Facility Core (Days 1–5)

**Theme:** Establish the facility data model with CRUD APIs and UI pages.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|------------|---------|
| 2.1 | Facility entity + EF config | `Facility` entity extending `BaseEntity` | Fields: Name, Type (core_facility, research_lab, teaching_lab, biosafety_lab), Location, Contacts, OperatingHours, IsActive. Configuration maps to `Facilities` table. |
| 2.2 | Facility CRUD API | `FacilitiesController` | Standard REST: GET list (paginated), GET by id, POST, PUT, DELETE (soft). MediatR commands/queries. FluentValidation. Route: `/api/v1/facilities`. |
| 2.12 | Room entity + EF config + API | `Room` entity, `Rooms` table, room CRUD | Fields: FacilityId, Name, RoomNumber, Capacity, RoomType, Utilization. RoomsController nested under facilities: `/api/v1/facilities/{facilityId}/rooms`. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 2.17 | Facilities List page | `facility/pages/facilities-list.tsx` — card grid with search, type filter, status badge |
| 2.18 | Facility Create/Edit forms | `facility/pages/create-facility.tsx`, `edit-facility.tsx` — react-hook-form + Zod |
| 2.19 | Facility Details page | `facility/pages/facility-details.tsx` — info panel, staff list, linked rooms/assets |
| 2.30 | Room Utilization dashboard | `facility/pages/room-utilization.tsx` — bar chart of room usage %, capacity heatmap |

**Sprint 1 Deliverables:** `Facilities` + `Rooms` tables, full CRUD API, list/create/edit/details pages, utilization dashboard.

---

### Sprint 2 — Asset Register & Lifecycle (Days 6–11)

**Theme:** Core asset model with instruments, search, and depreciation.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 2.3 | Asset entity + TPH inheritance | `Asset` entity (TPH base) | Fields: FacilityId, Category, Name, Identifier (serial#), Model, Manufacturer, AcquisitionDate, AcquisitionCost, CurrentValue, SalvageValue, UsefulLifeYears, DepreciationMethod, Location, Status, CustomFields (JSON), QrCode, RfidTag. Discriminator: `AssetType`. |
| 2.4 | Instrument entity (extends Asset) | `Instrument` class, `InstrumentConfig` table | Fields: IpAddress, Port, ConnectionProtocol, Firmware, LastCalibration, NextCalibration, MaintenanceIntervalDays, IotEnabled. Config as owned entity or separate table. |
| 2.5 | Asset CRUD API | `AssetsController` | Full lifecycle: create, read, update, decommission (status transition). File upload for attachments. Route: `/api/v1/assets`. |
| 2.6 | Asset search + filter API | Search endpoint on `AssetsController` | Query params: category, status, facilityId, location, custom field key-value, text search on name/identifier/model. |
| 2.15 | Elasticsearch indexing for assets | `AssetCreatedEvent` + `AssetUpdatedEvent` + ES consumer | Reuse `ElasticsearchService`. Index on create/update. `IAssetSearchService` wrapping NEST client. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 2.20 | Asset Register page | `facility/pages/assets-list.tsx` — DataTable with category tabs, status filters, search bar, CSV export |
| 2.21 | Asset Create/Edit forms | `facility/pages/create-asset.tsx`, `edit-asset.tsx` — dynamic fields by category (Instrument shows extra connection fields) |
| 2.22 | Asset Details page | `facility/pages/asset-details.tsx` — timeline, custody chain, attachments, telemetry widget, edit actions |

**Sprint 2 Deliverables:** `Assets` (with temporal), `Instruments`, `InstrumentConfigs` tables; full asset CRUD + search API; Elasticsearch indexing; asset register UI.

---

### Sprint 3 — Maintenance, Calibration & Operations (Days 12–16)

**Theme:** Equipment upkeep — maintenance scheduling, calibration tracking, depreciation engine, instrument dashboards.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 2.7 | Asset depreciation engine | `IDepreciationService` | Supports straight-line + declining balance. Hangfire scheduled job runs monthly to update `CurrentValue`. |
| 2.10 | Maintenance schedule + work orders | `MaintenanceRecord`, `WorkOrder` entities + CRUD | Fields: AssetId, Type (preventive/corrective/inspection), ScheduledDate, CompletedDate, TechnicianId, Status, Cost, Description. WorkOrders have assignee, priority, status. |
| 2.11 | Calibration tracking | `CalibrationRecord` entity + CRUD | Fields: InstrumentId, CalibrationDate, NextDueDate, PerformedBy, CertificateRef, Status. Hangfire job alerts when due. |
| 2.14 | Temporal table on Assets | EF temporal table migration | Enables `Asset` history querying via `TemporalAll()`, `TemporalAsOf()`, etc. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 2.23 | Asset Depreciation view | `facility/pages/asset-depreciation.tsx` — Recharts line chart (value over time) + amortization table |
| 2.25 | Instruments List page | `facility/pages/instruments-list.tsx` — status badges (online/offline/maintenance), connection status icons, quick filters |
| 2.26 | Instrument Details + Config page | `facility/pages/instrument-details.tsx`, `instrument-config.tsx` — detail view + connection/IP/firmware config form |
| 2.27 | Instrument Dashboard | `facility/pages/instrument-dashboard.tsx` — online/offline gauge, recent alerts, utilization bar |
| 2.28 | Maintenance scheduler + Work Order form | `facility/pages/maintenance-calendar.tsx`, `work-order-form.tsx` — calendar grid with maintenance events; modal form for create/edit |
| 2.29 | Calibration records page | `facility/pages/calibration-records.tsx` — list with due-date highlighting, status badges |

**Sprint 3 Deliverables:** Depreciation engine; `MaintenanceRecords`, `WorkOrders`, `CalibrationRecords` tables; maintenance calendar, instrument pages, calibration tracking UI.

---

### Sprint 4 — Advanced Features & Polish (Days 17–20)

**Theme:** Chain of custody, QR/barcode generation, telemetry ingestion, global search, integration tests.

#### Backend Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 2.8 | Chain of Custody — transfer workflow | `CustodyEvent` entity, `CustodyController` | Records: AssetId, FromUserId, ToUserId, FromLocation, ToLocation, Timestamp, Reason, SignatureRef. Transfer endpoint creates event + updates asset location. |
| 2.9 | QR/Barcode generation service | `IBarcodeService` | Generate QR code (via QRCoder or similar NuGet). Endpoint: `GET /api/v1/assets/{id}/qr` returns PNG. Print-friendly label format. |
| 2.13 | Instrument telemetry ingestion API | `TelemetryController` | POST endpoint for sensor data: `{ instrumentId, timestamp, metrics: { key: value } }`. Validates against `InstrumentConfig`. Stored in `TelemetryRecords` table. |
| 2.16 | Integration tests for Facility module | xUnit + Testcontainers tests | Tests for Facility CRUD, Asset lifecycle, Custody transfer, Maintenance work order flow, search. Uses test containers for SQL Server + Elasticsearch. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 2.24 | Chain of Custody transfer dialog | `facility/pages/custody-transfer-dialog.tsx` — wizard: select recipient → confirm location → digital signature (canvas) → submit |
| 2.31 | QR code label preview + print dialog | `facility/pages/qr-label-dialog.tsx` — preview QR code as printable label, download PNG |
| 2.32 | Global Search component (header) | `shared/components/global-search.tsx` — search bar in header, searches assets + users + facilities via Elasticsearch, keyboard shortcut (Ctrl+K) |

**Sprint 4 Deliverables:** Custody transfer workflow with e-signature, QR code generation, telemetry API, integration tests, global search bar.

---

## Solution Structure (Projects to Create)

```
backend/
├── Services/
│   └── Facility/
│       ├── ResearchLms.Facility.Domain/
│       │   ├── Entities/
│       │   │   ├── Facility.cs
│       │   │   ├── Room.cs
│       │   │   ├── Asset.cs
│       │   │   ├── Instrument.cs
│       │   │   ├── InstrumentConfig.cs
│       │   │   ├── MaintenanceRecord.cs
│       │   │   ├── WorkOrder.cs
│       │   │   ├── CalibrationRecord.cs
│       │   │   └── CustodyEvent.cs
│       │   ├── ValueObjects/
│       │   │   ├── AssetStatus.cs
│       │   │   ├── FacilityType.cs
│       │   │   ├── DepreciationMethod.cs
│       │   │   └── ConnectionProtocol.cs
│       │   └── Interfaces/
│       │       ├── IAssetRepository.cs
│       │       ├── IFacilityRepository.cs
│       │       ├── IDepreciationService.cs
│       │       └── IBarcodeService.cs
│       │
│       ├── ResearchLms.Facility.Application/
│       │   ├── Commands/
│       │   ├── Queries/
│       │   ├── DTOs/
│       │   ├── Mappings/
│       │   ├── Validators/
│       │   ├── EventHandlers/
│       │   └── DependencyInjection.cs
│       │
│       ├── ResearchLms.Facility.Infrastructure/
│       │   ├── Persistence/
│       │   │   ├── EntityConfigurations/
│       │   │   ├── AssetRepository.cs
│       │   │   └── FacilityRepository.cs
│       │   ├── Services/
│       │   │   ├── DepreciationService.cs
│       │   │   └── BarcodeService.cs
│       │   ├── EventConsumers/
│       │   └── DependencyInjection.cs
│       │
│       └── ResearchLms.Facility.Api/
│           ├── Controllers/
│           ├── Program.cs
│           ├── Dockerfile
│           └── appsettings.json
```

---

## Frontend Module Structure (To Create)

```
frontend/src/modules/facility/
├── pages/
│   ├── facilities-list.tsx
│   ├── create-facility.tsx
│   ├── edit-facility.tsx
│   ├── facility-details.tsx
│   ├── assets-list.tsx
│   ├── create-asset.tsx
│   ├── edit-asset.tsx
│   ├── asset-details.tsx
│   ├── asset-depreciation.tsx
│   ├── instruments-list.tsx
│   ├── instrument-details.tsx
│   ├── instrument-config.tsx
│   ├── instrument-dashboard.tsx
│   ├── maintenance-calendar.tsx
│   ├── work-order-form.tsx
│   ├── calibration-records.tsx
│   ├── room-utilization.tsx
│   └── custody-transfer-dialog.tsx
│   └── qr-label-dialog.tsx
├── components/
│   ├── asset-timeline.tsx
│   ├── custody-chain.tsx
│   └── asset-status-badge.tsx
└── __tests__/
    ├── facilities-list.test.tsx
    ├── assets-list.test.tsx
    ├── maintenance-calendar.test.tsx
    └── custody-transfer-dialog.test.tsx
```

Additionally, a shared component:
```
frontend/src/shared/components/global-search.tsx
```

---

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Temporal tables require SQL Server 2016+ | Low — we target 2022 | Ensure migration uses `UseTemporalTable()` correctly |
| QR code generation needs a NuGet package | Low | Use `QRCoder` (MIT, no dependencies). Add to Facility.Infrastructure. |
| Telemetry ingestion could become high-volume | Medium | Start with simple POST + table. Extract to TimescaleDB if needed later. |
| Chain of custody digital signature is simplified | Low | Start with canvas-based capture (no PKI). Upgrade to proper e-signature in Phase 5. |
| Global search requires Elasticsearch running | Medium | Graceful degradation — show local filter results if ES unavailable |
| Instrument Dashboard needs real-time data | Low | Start with poll-based refresh; add SignalR later |

---

## Phase 1 → Phase 2 Handoff Checklist

- [x] Solution structure with Clean Architecture pattern
- [x] Multi-tenant middleware + global query filters
- [x] JWT auth + RBAC permission system
- [x] Elasticsearch service class (reusable)
- [x] MediatR CQRS pattern
- [x] FluentValidation setup
- [x] Serilog logging
- [x] Gateway routing (add facility cluster)
- [x] Docker Compose (add facility-api service)
- [ ] Created frontend `modules/facility/` folder
- [ ] Facility permission strings added to seed data
- [ ] Facility role permissions added to role-permission assignment
