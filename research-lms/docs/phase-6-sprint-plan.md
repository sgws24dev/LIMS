# Phase 6 — Analytics & BI: Sprint Plan

**Timeline:** Weeks 17–21 (5 weeks @ 5 days = 25 working days)
**Status:** Greenfield — no existing Analytics or BI code
**Dependency on Phase 5:** Billing (invoices, pricing, ERP) and Compliance (audit logs, signatures) modules are complete. Phase 4 ServiceWorkflow, Projects, and Inventory modules also operational. Shared infrastructure (multi-tenancy, MediatR, FluentValidation, Serilog, MassTransit, Hangfire, Docker Compose, YARP Gateway) already in place.

---

## Architecture Decisions

### Service Boundary
Phase 6 extends the existing `Services/Billing/` microservice with Analytics capabilities. No new microservice is introduced — Analytics & BI features are embedded within the Billing service for cohesion with financial dashboards, with a separate `Services/Analytics/` microservice only if BI workload isolation becomes necessary later.

| Microservice | Modules | Rationale |
|-------------|---------|-----------|
| `Services/Billing/` (extended) | Dashboards + Widgets + Ad-hoc Reports + Scheduled Reports | Dashboards primarily aggregate billing/instrument data; co-located avoids cross-service latency |

### Database Strategy
- `DashboardDefinitions` and `DashboardWidgets` tables in `BillingDb` (user-specific layout + widget configuration)
- `ReportDefinitions` and `ReportSchedules` tables in `BillingDb` (saved report queries + scheduling config)
- `AggregationTables` in `BillingDb` for pre-aggregated rollups (daily/weekly/monthly)
- SQL Server indexed views for common queries (high-performance reads)

### Widget Data Source Pattern
```
Widget (frontend) → GET /api/v1/billing/dashboards/{id}/widgets/{widgetId}/data?from=&to=
                                                      ↓
                                        IWidgetDataSource (resolved by type)
                                                      ↓
                                     KpiDataSource | ChartDataSource | TableDataSource
                                                      ↓
                                          Aggregation tables / live queries
```
- `IWidgetDataSource` interface: `Task<WidgetData> GetDataAsync(WidgetConfig config, DateTime from, DateTime to)`
- Each widget type implements its own data source (KPI, line chart, bar chart, pie chart, table, instrument 365)
- Data sources choose between pre-aggregated tables (fast) and live queries (exact)

### Ad-Hoc Report Engine Pattern
```
ReportBuilder (frontend) → GET /api/v1/billing/reports/preview?fields=...&filters=...
                                                  ↓
                                       IReportService
                                                  ↓
                                  Dynamic LINQ query builder
                                  (System.Linq.Dynamic.Core)
                                                  ↓
                                       IQueryable → List<ExpandoObject>
                                                  ↓
                               IReportExportService (PDF / CSV / Excel)
```
- Uses `System.Linq.Dynamic.Core` for dynamic field selection and filtering at runtime
- No code generation — all query construction is expression-tree based
- Export service wraps EPPlus (Excel), CSV helper, and Razor-to-PDF (QuestPDF)

### Scheduled Report Delivery
```
ReportSchedule → Hangfire Cron Job (every N minutes/hours/days/weeks/months)
                      ↓
            ReportExecutionJob
                      ↓
          IReportService.Run(reportDefinition)
                      ↓
          IReportExportService.Export(reportData, format)
                      ↓
          IEmailService.Send(recipients, attachment)
```
- `ReportSchedule` supports cron expressions, time zone, format (PDF/CSV/Excel), and recipient list
- Hangfire job enqueued when schedule is created; unscheduled when deleted/paused
- Delivery logged in `ReportSchedules.DeliveryLog` (nvarchar(max) JSON)

### Instrument 365 View
- Aggregation service computes 365 days of instrument metrics in a single materialized/indexed view
- Columns per day: date, total bookings, utilized hours, idle hours, downtime hours, revenue generated, service events
- Frontend renders as a GitHub-style contribution heatmap plus summary KPI cards

### Caching Strategy
- Dashboard layouts cached in `IMemoryCache` (TTL 5 minutes, invalidated on layout save)
- Widget data cached per-query-hash in Redis (TTL 1 minute for live data, 15 minutes for aggregations)
- Report results cached until next scheduled run or manual refresh

---

## Scope Summary

| Area | Backend Tasks | Frontend Tasks | DB Tables | Est. Effort |
|------|:-------------:|:--------------:|-----------|:-----------:|
| Dashboards | 6.1, 6.2, 6.3 | 6.13, 6.14, 6.22, 6.23 | `DashboardDefinitions`, `DashboardWidgets` | 12 days |
| KPI + Chart + Table Widgets | 6.4, 6.5 | 6.15, 6.16, 6.17 | — | 9 days |
| Instrument 365 View | 6.6 | 6.18 | Indexed view | 7 days |
| Ad-hoc Reports | 6.7, 6.8 | 6.19, 6.20 | `ReportDefinitions` | 14 days |
| Scheduled Reports | 6.9 | 6.21 | `ReportSchedules` | 4 days |
| Aggregation & Performance | 6.10, 6.11 | — | `AggregationTables`, indexed views | 4 days |
| Integration Tests | 6.12 | — | — | 2 days |
| **Total** | **12 backend** | **11 frontend** | **5 tables + views** | **~52 days** |

---

## Sprint Breakdown

---

### Sprint 1 — Dashboards Foundation (Week 17, Days 1–5)

**Theme:** Dashboard entity design, CRUD API, widget data provider framework, drag-and-drop grid layout, widget picker UI.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 6.1 | Dashboard Definition entity + EF config | `DashboardDefinition` entity, `BillingDbContext` config | **DashboardDefinition** fields: TenantId, Name, Description, Layout (nvarchar(max) — JSON: `{widgets: [{widgetId, x, y, w, h, type}]}`), IsDefault, IsShared, CreatedByUserId, CreatedAt, UpdatedAt. **DashboardWidget** fields: TenantId, DashboardId, WidgetType (Kpi/LineChart/BarChart/PieChart/AreaChart/Table/Instrument365), Config (nvarchar(max) — JSON of type-specific options: metric, aggregation, color, comparison period, etc.), Position (x, y, w, h), IsVisible, CreatedAt, UpdatedAt. Configuration maps to `DashboardDefinitions` and `DashboardWidgets` tables with FK and cascade delete. |
| 6.2 | Dashboard CRUD API | `DashboardsController` | Standard REST: GET list (by tenant, with pagination), GET by id (with nested widgets), POST create (with initial layout), PUT update layout (save grid positions), PUT update widget config, DELETE dashboard (cascade deletes widgets), POST clone (duplicate dashboard with new id). Routes: `/api/v1/billing/dashboards`. FluentValidation: name required, layout must reference valid widget IDs. |
| 6.3 | Widget data provider framework | `IWidgetDataSource`, `WidgetDataSourceResolver` | `IWidgetDataSource<TConfig>` — generic interface for typed config. `WidgetDataSourceResolver(IEnumerable<IWidgetDataSource>)` resolves by `WidgetType`. Base class `WidgetDataSourceBase` with common `DateTime from, to` handling. Registers all data sources in DI via `AddScoped<IWidgetDataSource, KpiDataSource>()` pattern. Data endpoint: `GET /api/v1/billing/dashboards/{id}/widgets/{widgetId}/data?from=&to=` — returns `WidgetData` (labels: string[], datasets: {label, data: decimal[], color}[]). |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 6.13 | Dashboard grid layout component | `billing/components/DashboardGrid.tsx` — Wraps `react-grid-layout`. Reads layout JSON from dashboard definition, renders widgets at their grid positions. Draggable and resizable. On layout change, debounces save to `PUT /api/v1/billing/dashboards/{id}`. Handles empty state (show "Add Widget" prompt center-screen). Responsive breakpoints (single-column on mobile). |
| 6.14 | Widget picker + configuration dialog | `billing/components/WidgetPicker.tsx`, `billing/components/WidgetConfigDialog.tsx` — **WidgetPicker**: modal grid of available widget types (KPI, Line Chart, Bar Chart, Pie Chart, Area Chart, Table, Instrument 365) with icon, name, description. On select, opens WidgetConfigDialog. **WidgetConfigDialog**: dynamic form based on widget type. For KPI: metric selector (revenue, utilization, bookings, etc.), comparison toggle (vs previous period), format (currency, percentage, number). For charts: metric, aggregation (sum/avg/count), date granularity (day/week/month), color picker. Save adds widget to dashboard and refreshes grid. |

**Sprint 1 Deliverables:** `DashboardDefinitions` + `DashboardWidgets` tables, Dashboards CRUD API, widget data provider framework, DashboardGrid component, WidgetPicker + WidgetConfigDialog.

---

### Sprint 2 — KPI, Chart & Table Widget Data (Week 18, Days 6–10)

**Theme:** KPI metrics, chart aggregation queries, table data sources, widget rendering components.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 6.4 | KPI widget data sources | `KpiDataSource` | `KpiDataSource` implements `IWidgetDataSource<KpiConfig>`. Metrics: TotalRevenue, OutstandingReceivables, OverdueAmount, AvgDaysToPay, UtilizationRate (from Bookings via MassTransit query or direct DB view), ActiveBookings, PendingServiceRequests. Each metric queries across billing + facility data. Supports optional `ComparisonPeriod` (previous month/quarter/year) — returns `current` and `previous` values with `changePercent` and `trendDirection` (up/down/flat). Handles period-over-period calculation. |
| 6.5 | Chart widget data sources | `ChartDataSource` | `ChartDataSource` implements `IWidgetDataSource<ChartConfig>`. Chart types: line (time-series), bar (categorical comparison), pie (proportion breakdown), area (cumulative time-series). Aggregation queries: RevenueByMonth, RevenueByCategory (equipment usage, service requests, consumables, membership), BookingsByInstrument, UtilizationByFacility, OverdueByAgingBucket (0-30/31-60/61-90/90+ days). Supports grouping by day/week/month/quarter. Returns `WidgetData` with labels, datasets, colors. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 6.15 | KPI Widget component | `billing/components/widgets/KpiWidget.tsx` — Displays a single metric with: label, current value (formatted: currency, percentage, or number), trend indicator (arrow up/down + percentage change, color-coded green/red), sparkline mini-chart (last 12 periods). Click opens detail drill-down (e.g., clicking "Overdue Receivables" shows list of overdue invoices). Configurable precision and format via widget config. Loading skeleton while data fetches. |
| 6.16 | Chart Widget component | `billing/components/widgets/ChartWidget.tsx` — Wraps Recharts. Renders line, bar, pie, or area chart based on widget config. Legend, tooltip, responsive container. Supports date range selector in header (7d, 30d, 90d, 1y, custom). Download chart as PNG (via `html-to-image` or canvas export). Empty state when no data. Loading skeleton. |
| 6.17 | Table Widget component | `billing/components/widgets/TableWidget.tsx` — Sortable, filterable data table. Columns defined by widget config. Inline search, column visibility toggle, export to CSV. Paginated (server-side if > 100 rows). Row click emits event for drill-down. Supports conditional formatting (highlight negative values red, positive green). |

**Sprint 2 Deliverables:** KPI data sources (6 metrics), chart data sources (7 aggregation queries), KpiWidget with sparkline + trend, ChartWidget (4 chart types), TableWidget with sort/filter/export.

---

### Sprint 3 — Instrument 365 View & Ad-Hoc Report Engine (Week 19, Days 11–15)

**Theme:** 365-day instrument heatmap, dynamic report engine with custom fields and filters.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 6.6 | Instrument 365 View aggregation service | `Instrument365AggregationService`, indexed view | SQL Server indexed view (or materialized view refreshed daily via Hangfire): `vw_InstrumentDailyMetrics` with columns: TenantId, InstrumentId, Date, TotalBookings, UtilizedHours, IdleHours, DowntimeHours, RevenueGenerated, ServiceEventCount, MaintenanceHours. `Instrument365AggregationService` queries this view for a given instrument + date range. API: `GET /api/v1/billing/instruments/{id}/365?year=2026` — returns 365 rows with daily metrics. Also returns summary KPIs: total revenue, utilization %, downtime %, avg bookings/day, top service month. Uses SQL Server indexed view hint (`WITH (NOEXPAND)`) for performance. |
| 6.7 | Ad-hoc report engine | `IReportService`, `DynamicQueryBuilder` | `IReportService` — interface: `Task<ReportResult> RunAsync(ReportDefinition definition)`, `Task<ReportPreview> PreviewAsync(ReportField[], ReportFilter[])`. `DynamicQueryBuilder` uses `System.Linq.Dynamic.Core` to construct `IQueryable` with `Select` (dynamic fields) and `Where` (dynamic filters). Supported data sources: Invoices, InvoiceLineItems, Bookings, Instruments, Assets (whitelist for security). **ReportField** properties: SourceEntity (string), FieldName (string), DisplayName, Aggregation (Sum/Avg/Count/None). **ReportFilter** properties: FieldName, Operator (Equals/NotEquals/GreaterThan/LessThan/Contains/Between/In), Value (string). API: `POST /api/v1/billing/reports/preview` — returns first 100 rows + column metadata. `POST /api/v1/billing/reports/run` — returns full result set (paginated). **ReportDefinition** table fields saved to DB: TenantId, Name, Description, SourceEntity, Fields (nvarchar(max) — JSON array of ReportField), Filters (nvarchar(max) — JSON array of ReportFilter), CreatedByUserId, CreatedAt, UpdatedAt. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 6.18 | Instrument 365 View page | `billing/pages/Instrument365View.tsx` — Route: `/billing/instruments/:id/365`. Instrument selector/search at top. GitHub-style contribution heatmap: 52 columns (weeks) × 7 rows (days), each cell colored by intensity of chosen metric (bookings, utilization, revenue, downtime). Color scale: light → dark. Click cell shows tooltip with day detail. Below heatmap: 4 KPI cards (Total Revenue, Avg Utilization %, Total Downtime Hours, Total Bookings). Line chart below: metric trend over 12 months. Month/year navigation. |

**Sprint 3 Deliverables:** `vw_InstrumentDailyMetrics` indexed view, Instrument 365 aggregation service + API endpoint, Instrument 365 heatmap page, `IReportService` + `DynamicQueryBuilder` (dynamic LINQ), report preview/run API endpoints.

---

### Sprint 4 — Report Builder UI, Export & Results Viewer (Week 20, Days 16–20)

**Theme:** Drag-and-drop report builder, report results viewer, PDF/CSV/Excel export.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 6.8 | Report export service | `IReportExportService` | Three export implementations: **CsvExportService** — uses `CsvHelper` or manual StringBuilder (RFC 4180 compliant). Steam output as `text/csv`. **ExcelExportService** — uses EPPlus: creates workbook with header row (styled), data rows, auto-filter, frozen header, number formatting. **PdfExportService** — uses QuestPDF: renders table with headers, alternating row colors, page numbers, configurable page orientation (landscape for wide tables). API: `GET /api/v1/billing/reports/{id}/export?format=csv|pdf|xlsx` — returns file download with appropriate Content-Type and Content-Disposition. Large exports streamed (chunked transfer encoding). |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 6.19 | Ad-hoc report builder UI | `billing/pages/ReportBuilder.tsx` — Route: `/billing/reports/builder`. Multi-step or single-page drag-and-drop interface. Left panel: available data sources (entity tree: Invoices > InvoiceNumber, InvoiceDate, TotalAmount, etc.; Bookings > InstrumentName, StartTime, etc.). Click/select fields to add to report. Center: selected fields list with drag-to-reorder, aggregation selector (None/Sum/Avg/Count) per field. Right panel: filter builder — add filter rows (field, operator, value), AND/OR logic. Top bar: report name input, Save button, Run button. Bottom: preview table (first 50 rows, auto-refreshes on field/filter change via debounced `POST /api/v1/billing/reports/preview`). Save prompts for name + description, persists `ReportDefinition`. |
| 6.20 | Report results viewer | `billing/components/ReportViewer.tsx` — Full results table (virtualized if > 500 rows). Column sorting (client-side for paginated results, server-side for full). Export dropdown (CSV, PDF, Excel) triggers `GET /api/v1/billing/reports/{id}/export?format=...`. Schedule button opens ReportScheduleDialog. Chart toggle: renders selected numeric columns as bar/line/pie chart overlay on results. Full-screen mode. Pagination. |

**Sprint 4 Deliverables:** CSV/Excel/PDF export service, EPPlus + QuestPDF integration, report builder UI with field picker + filter builder + live preview, report results viewer with export and chart toggle.

---

### Sprint 5 — Scheduled Reports, Aggregation Jobs & Integration Tests (Week 21, Days 21–25)

**Theme:** Hangfire cron scheduling, pre-aggregation rollups, database performance tuning, integration tests, analytics home page, dashboard sharing.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 6.9 | Scheduled report delivery | `ReportSchedule` entity, `ReportExecutionJob` | **ReportSchedule** fields: TenantId, ReportDefinitionId, CronExpression, TimeZoneId, Format (Csv/Pdf/Xlsx), Recipients (nvarchar(max) — JSON array of email strings), Subject (string with {{ReportName}}/{{Date}} placeholders), IsActive, LastDeliveredAt, NextRunAt, CreatedAt. API: CRUD for report schedules (`GET/POST/PUT/DELETE /api/v1/billing/report-schedules`). `ReportExecutionJob` (Hangfire): resolves ReportDefinition, runs via `IReportService`, exports via `IReportExportService`, sends email with attachment via `IEmailService` (interface from shared BuildingBlocks). Hangfire job enqueued via `RecurringJob.AddOrUpdate<ReportExecutionJob>()` on create/update, removed on delete. Delivery attempt logged (success/failure, timestamp, error message). |
| 6.10 | Analytics aggregation jobs | Hangfire recurring aggregation jobs | Three Hangfire jobs: **DailyRollupJob** (runs at 01:00 daily) — aggregates daily revenue, bookings, utilization into `AggregationTables` (Day, Metric, Value). **WeeklyRollupJob** (runs at 02:00 every Monday) — summarizes weekly trends, creates 4-week and 12-week moving averages. **MonthlyRollupJob** (runs at 03:00 on 1st of month) — finalizes monthly numbers, updates previous-year comparison data. Each job upserts into `AggregationTables` (columns: TenantId, Granularity (Day/Week/Month), DateKey, MetricName, MetricValue, CreatedAt). Job failure sends alert via `INotificationService` (admin email). |
| 6.11 | SQL Server views + indexed views | Performance optimization | Create SQL Server views for common dashboard queries: `vw_DashboardRevenue` (daily revenue totals by category with moving averages), `vw_DashboardUtilization` (instrument utilization rates by facility by day), `vw_DashboardAging` (receivables aging summaries by bucket). Create indexed views (`WITH SCHEMABINDING`) where appropriate (aggregate-only, no joins on same table). Add index recommendations: `CREATE NONCLUSTERED INDEX IX_Invoices_TenantId_InvoiceDate ... INCLUDE (TotalAmount, Status)` for dashboard queries. Deploy as migration SQL scripts (`/migrations/` folder). |
| 6.12 | Integration tests | xUnit + Testcontainers tests | Create `AnalyticsWebApplicationFactory` (extends `BillingWebApplicationFactory` from Phase 5). Test classes: `DashboardCrudTests` — create/update/delete dashboards + widgets, verify layout persistence. `WidgetDataTests` — KPI data source returns correct metric values, chart data source respects date range and grouping, empty data response when no records. `Instrument365Tests` — aggregation view returns 365 rows, summary KPIs calculated correctly. `ReportEngineTests` — dynamic query builder constructs correct LINQ for field selection + filters, report preview returns expected columns, pivot/aggregation works. `ReportExportTests` — CSV/PDF/Excel export produces valid files with correct headers and data. `ReportScheduleTests` — schedule CRUD, Hangfire job enqueue/dequeue, email delivery with attachment. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 6.21 | Report schedule configuration dialog | `billing/components/ReportScheduleDialog.tsx` — Modal dialog: cron expression builder (presets: Daily 8 AM, Weekly Monday 9 AM, Monthly 1st 8 AM), time zone selector, format radio (CSV/PDF/Excel), recipient list (email chips with validation). Preview next 5 run dates. Toggle active/inactive. Edit existing schedule. |
| 6.22 | Analytics Dashboard home page | `billing/pages/AnalyticsHome.tsx` — Route: `/billing/analytics`. Grid of saved dashboards (cards with name, description, last modified, thumbnail of layout). "Create Dashboard" button. Quick-access section: "Recently viewed", "Shared with me". Saved reports list below: name, last run, schedule status. Quick action buttons: New Report, New Dashboard. Empty state with illustration for first-time users. |
| 6.23 | Dashboard sharing dialog | `billing/components/DashboardShareDialog.tsx` — Modal: search users by name/email, select permission level (View Only / Can Edit), add/remove users. Saves to `DashboardDefinition.SharedWith` (nvarchar(max) — JSON array of `{userId, permission}`). Backend enforces permissions: `GET /api/v1/billing/dashboards` filters to own + shared. PUT/DELETE checks edit permission. |

#### Operations Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| — | EF Core migration for new tables | Migration | `dotnet ef migrations add Analytics_Definitions --project Services/Billing/ResearchLms.Billing.Infrastructure` — creates `DashboardDefinitions`, `DashboardWidgets`, `ReportDefinitions`, `ReportSchedules`, `AggregationTables` tables. |
| — | SQL Server view deployment script | SQL migration script | `migrations/V6.1__Create_Analytics_Views.sql` with `CREATE VIEW` statements for dashboard aggregation views. `migrations/V6.2__Create_Analytics_IndexedViews.sql` for indexed views. |
| — | Frontend routing + sidebar | Route + nav update | Add `/billing/analytics` route to `App.tsx`. Add "Analytics" section in sidebar under Billing with links: Dashboards, Reports, Instrument 365. |

**Sprint 5 Deliverables:** `ReportSchedule` table + CRUD + Hangfire delivery job, 3 aggregation rollup jobs (daily/weekly/monthly), SQL Server views + index optimization, integration tests (5 test classes), report schedule dialog, analytics home page, dashboard sharing dialog, EF Core migration, SQL deployment scripts.

---

## New / Extended Entity Structures

### Extended `Services/Billing/ResearchLms.Billing.Domain/`

```
├── Entities/
│   ├── DashboardDefinition.cs        (NEW)
│   ├── DashboardWidget.cs            (NEW)
│   ├── ReportDefinition.cs           (NEW)
│   ├── ReportSchedule.cs             (NEW)
│   └── AggregationTable.cs           (NEW — or use raw SQL views)
├── Enums/
│   ├── WidgetType.cs                 (NEW — Kpi, LineChart, BarChart, PieChart, AreaChart, Table, Instrument365)
│   ├── ReportFormat.cs               (NEW — Csv, Pdf, Xlsx)
│   └── AggregationGranularity.cs     (NEW — Day, Week, Month, Quarter, Year)
├── ValueObjects/
│   ├── WidgetData.cs                 (NEW — labels, datasets)
│   ├── WidgetConfig.cs               (NEW — base config)
│   ├── KpiConfig.cs                  (NEW — metric, comparison)
│   ├── ChartConfig.cs                (NEW — chart type, metric, groupBy, granularity)
│   ├── TableConfig.cs                (NEW — columns, sort)
│   ├── ReportField.cs                (NEW — sourceEntity, fieldName, aggregation)
│   ├── ReportFilter.cs               (NEW — fieldName, operator, value)
│   └── ReportResult.cs               (NEW — columns, rows, totalCount)
└── Interfaces/
    ├── IWidgetDataSource.cs          (NEW)
    ├── IReportService.cs             (NEW)
    ├── IReportExportService.cs       (NEW)
    └── IInstrument365Service.cs      (NEW)
```

### Extended `Services/Billing/ResearchLms.Billing.Application/`

```
├── Commands/
│   ├── Dashboards/
│   │   ├── CreateDashboardCommand.cs
│   │   ├── UpdateDashboardCommand.cs
│   │   ├── DeleteDashboardCommand.cs
│   │   └── CloneDashboardCommand.cs
│   ├── Widgets/
│   │   └── UpdateWidgetConfigCommand.cs
│   ├── Reports/
│   │   ├── CreateReportDefinitionCommand.cs
│   │   ├── UpdateReportDefinitionCommand.cs
│   │   └── DeleteReportDefinitionCommand.cs
│   └── ReportSchedules/
│       ├── CreateReportScheduleCommand.cs
│       ├── UpdateReportScheduleCommand.cs
│       └── DeleteReportScheduleCommand.cs
├── Queries/
│   ├── Dashboards/
│   │   ├── GetDashboardsQuery.cs
│   │   ├── GetDashboardByIdQuery.cs
│   │   └── GetWidgetDataQuery.cs
│   ├── Reports/
│   │   ├── PreviewReportQuery.cs
│   │   ├── RunReportQuery.cs
│   │   ├── ExportReportQuery.cs
│   │   └── GetReportSchedulesQuery.cs
│   └── Instruments/
│       └── GetInstrument365Query.cs
├── DTOs/
│   ├── DashboardDefinitionDto.cs
│   ├── DashboardWidgetDto.cs
│   ├── WidgetDataDto.cs
│   ├── ReportDefinitionDto.cs
│   ├── ReportPreviewDto.cs
│   ├── ReportResultDto.cs
│   ├── ReportScheduleDto.cs
│   └── Instrument365Dto.cs
├── Validators/
│   ├── CreateDashboardValidator.cs
│   ├── CreateReportDefinitionValidator.cs
│   └── CreateReportScheduleValidator.cs
└── DependencyInjection.cs            (extended)
```

### Extended `Services/Billing/ResearchLms.Billing.Infrastructure/`

```
├── Persistence/
│   ├── BillingDbContext.cs           (extended — add DbSets)
│   └── EntityConfigurations/
│       ├── DashboardDefinitionConfiguration.cs
│       ├── DashboardWidgetConfiguration.cs
│       ├── ReportDefinitionConfiguration.cs
│       └── ReportScheduleConfiguration.cs
├── Services/
│   ├── WidgetDataSources/
│   │   ├── KpiDataSource.cs
│   │   ├── ChartDataSource.cs
│   │   ├── TableDataSource.cs
│   │   └── Instrument365DataSource.cs
│   ├── ReportServices/
│   │   ├── DynamicQueryBuilder.cs
│   │   ├── ReportService.cs
│   │   └── ReportExportService.cs
│   ├── Instrument365AggregationService.cs
│   └── BackgroundJobs/
│       ├── ReportExecutionJob.cs
│       ├── DailyRollupJob.cs
│       ├── WeeklyRollupJob.cs
│       └── MonthlyRollupJob.cs
└── DependencyInjection.cs            (extended)
```

### Extended `Services/Billing/ResearchLms.Billing.Api/`

```
├── Controllers/
│   ├── DashboardsController.cs       (NEW)
│   ├── ReportsController.cs          (extended — add report definition + schedule endpoints)
│   └── InstrumentsController.cs      (NEW — 365 view)
└── Program.cs                        (unchanged — existing partial class)
```

---

## Frontend Module Structure (Extended)

```
frontend/src/modules/billing/
├── pages/
│   ├── financial-dashboard.tsx         (existing — Phase 5)
│   ├── invoices-list.tsx               (existing — Phase 5)
│   ├── invoice-details.tsx             (existing — Phase 5)
│   ├── create-invoice.tsx              (existing — Phase 5)
│   ├── pricing-models-page.tsx         (existing — Phase 5)
│   ├── rebates-page.tsx                (existing — Phase 5)
│   ├── credits-page.tsx                (existing — Phase 5)
│   ├── tax-codes-page.tsx              (existing — Phase 5)
│   ├── erp-sync-dashboard.tsx          (existing — Phase 5)
│   ├── depreciation-reports.tsx        (existing — Phase 5)
│   ├── AnalyticsHome.tsx               (NEW — Dashboard)
│   ├── Instrument365View.tsx           (NEW)
│   └── ReportBuilder.tsx               (NEW)
├── components/
│   ├── invoice-pdf-preview.tsx         (existing)
│   ├── rate-editor.tsx                 (existing)
│   ├── invoice-status-badge.tsx        (existing)
│   ├── erp-sync-status-badge.tsx       (existing)
│   ├── DashboardGrid.tsx               (NEW)
│   ├── WidgetPicker.tsx                (NEW)
│   ├── WidgetConfigDialog.tsx          (NEW)
│   ├── widgets/
│   │   ├── KpiWidget.tsx               (NEW)
│   │   ├── ChartWidget.tsx             (NEW)
│   │   └── TableWidget.tsx             (NEW)
│   ├── ReportViewer.tsx                (NEW)
│   ├── ReportScheduleDialog.tsx        (NEW)
│   └── DashboardShareDialog.tsx        (NEW)
```

---

## API Routes (New / Extended)

### Billing — Dashboards

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| GET | `/api/v1/billing/dashboards` | Dashboards | List (by tenant, paginated) |
| GET | `/api/v1/billing/dashboards/{id}` | Dashboards | Get by ID (with widgets) |
| POST | `/api/v1/billing/dashboards` | Dashboards | Create |
| PUT | `/api/v1/billing/dashboards/{id}` | Dashboards | Update layout + metadata |
| DELETE | `/api/v1/billing/dashboards/{id}` | Dashboards | Delete (cascade widgets) |
| POST | `/api/v1/billing/dashboards/{id}/clone` | Dashboards | Duplicate dashboard |
| GET | `/api/v1/billing/dashboards/{id}/widgets/{widgetId}/data` | Dashboards | Get widget data (query: from, to) |
| PUT | `/api/v1/billing/dashboards/{id}/widgets/{widgetId}` | Dashboards | Update widget config |

### Billing — Reports

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| POST | `/api/v1/billing/reports/preview` | Reports | Preview (first 100 rows) |
| POST | `/api/v1/billing/reports/run` | Reports | Run full report (paginated) |
| GET | `/api/v1/billing/reports/{id}/export` | Reports | Export (format=csv/pdf/xlsx) |
| GET | `/api/v1/billing/report-definitions` | Reports | List saved report definitions |
| GET | `/api/v1/billing/report-definitions/{id}` | Reports | Get report definition by ID |
| POST | `/api/v1/billing/report-definitions` | Reports | Save report definition |
| PUT | `/api/v1/billing/report-definitions/{id}` | Reports | Update report definition |
| DELETE | `/api/v1/billing/report-definitions/{id}` | Reports | Delete report definition |

### Billing — Report Schedules

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| GET | `/api/v1/billing/report-schedules` | Reports | List schedules |
| GET | `/api/v1/billing/report-schedules/{id}` | Reports | Get schedule by ID |
| POST | `/api/v1/billing/report-schedules` | Reports | Create schedule |
| PUT | `/api/v1/billing/report-schedules/{id}` | Reports | Update schedule |
| DELETE | `/api/v1/billing/report-schedules/{id}` | Reports | Delete schedule |

### Billing — Instruments

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| GET | `/api/v1/billing/instruments/{id}/365` | Instruments | 365-day metrics (query: year) |

---

## DB Schema (New Tables)

All new tables live in `BillingDb` (no new database).

| Table | Key Columns | Notes |
|-------|------------|-------|
| `DashboardDefinitions` | TenantId, Name, Description, Layout (nvarchar(max) — JSON), IsDefault, IsShared, SharedWith (nvarchar(max) — JSON), CreatedByUserId, CreatedAt, UpdatedAt | User-configurable dashboard; layout stores widget grid positions |
| `DashboardWidgets` | TenantId, DashboardId (FK), WidgetType (int), Config (nvarchar(max) — JSON), PositionX, PositionY, Width, Height, IsVisible, CreatedAt, UpdatedAt | Widget configuration stored as JSON blob; FK cascade on delete |
| `ReportDefinitions` | TenantId, Name, Description, SourceEntity, Fields (nvarchar(max) — JSON), Filters (nvarchar(max) — JSON), CreatedByUserId, CreatedAt, UpdatedAt | Saved ad-hoc report queries |
| `ReportSchedules` | TenantId, ReportDefinitionId (FK), CronExpression, TimeZoneId, Format (int), Recipients (nvarchar(max) — JSON), Subject, IsActive, LastDeliveredAt, NextRunAt, CreatedAt | Hangfire cron schedule for recurring report delivery |
| `AggregationTables` | TenantId, Granularity (Day/Week/Month), DateKey, MetricName, MetricValue (decimal), CreatedAt | Pre-aggregated rollup data for fast dashboard queries |

### Indexed Views (in `BillingDb`)

| View | Columns | Purpose |
|------|---------|---------|
| `vw_DashboardRevenue` | TenantId, Date, Category, DailyRevenue, MovingAvg7d, MovingAvg30d | Revenue trends |
| `vw_DashboardUtilization` | TenantId, Date, FacilityId, InstrumentId, UtilizationRate, BookedHours, AvailableHours | Instrument utilization |
| `vw_DashboardAging` | TenantId, AgingBucket (0-30/31-60/61-90/90+), Count, TotalAmount, WeightedAvgDays | Receivables aging |
| `vw_InstrumentDailyMetrics` | TenantId, InstrumentId, Date, TotalBookings, UtilizedHours, IdleHours, DowntimeHours, RevenueGenerated, ServiceEventCount, MaintenanceHours | Instrument 365 aggregated daily metrics |

---

## Caching Strategy

| Cache Target | Cache Store | Key | TTL | Invalidation |
|--------------|-------------|-----|:---:|:------------:|
| Dashboard layout | `IMemoryCache` | `dash_{tenantId}_{dashboardId}` | 5 min | On layout save |
| Widget data (aggregations) | Redis | `wdata_{widgetType}_{configHash}_{from}_{to}` | 15 min | On aggregation job completion |
| Widget data (live queries) | Redis | `wdata_{widgetType}_{configHash}_{from}_{to}` | 1 min | TTL expiry |
| Report preview | Redis | `rpreview_{reportDefId}_{fieldFilterHash}` | 5 min | On report definition update |
| Report export file | Disk/file cache | `rexport_{reportDefId}_{format}_{timestamp}` | 1 hour | On next scheduled run |
| Instrument 365 data | `IMemoryCache` | `inst365_{tenantId}_{instrumentId}_{year}` | 30 min | On daily rollup job |

---

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| `System.Linq.Dynamic.Core` may not support all query patterns (e.g., nested grouping, pivot) | Medium | Fall back to raw SQL via `Dapper` for unsupported patterns. Dynamic LINQ used for simple field selection and filtering only. Complex aggregations use pre-built queries. |
| react-grid-layout may have React 18+ compatibility issues | Medium | Pin known-good version (`react-grid-layout@1.3.4`). Test layout persistence with multi-column drag-and-drop early in Sprint 1. |
| Dashboard performance with large datasets (10k+ invoices) | Medium | Pre-aggregation jobs (Sprint 5) reduce live query volume. Widget data endpoint returns max 500 data points (downsampled). Use indexed views + Redis caching. |
| Scheduled report email delivery depends on `IEmailService` (shared BuildingBlocks) | Low | `IEmailService` interface defined in Phase 1 BuildingBlocks. Mock implementation for dev/test. Real SMTP/SendGrid connector configured in production appsettings. |
| Hangfire cron jobs conflict with Phase 5 ERP sync jobs | Low | Separate Hangfire server instances or use different queues (`analytics-daily`, `analytics-weekly`, `analytics-monthly`). All jobs are lightweight aggregation upserts (< 1 second each). |
| Instrument 365 depends on cross-service data (Facility bookings, Billing invoices) | Medium | Indexed view joins across Billing and Facility DBs via SQL Server linked server or cross-database query. If cross-DB query is not permitted, use Hangfire job to populate aggregation table daily. |

---

## Phase 5 → Phase 6 Handoff Checklist

- [x] Phase 5 modules complete: Billing (Invoicing, Pricing, ERP), Compliance (Audit, Signatures)
- [x] `BillingDbContext` registered with all Phase 5 entities
- [x] Integration test infrastructure (`BillingWebApplicationFactory`) operational
- [x] Shared infrastructure (multi-tenancy, MassTransit, Hangfire, Docker Compose, YARP) operational
- [x] Frontend `modules/billing/` with pages and components directory structure in place
- [ ] New entities defined: `DashboardDefinition`, `DashboardWidget`, `ReportDefinition`, `ReportSchedule`
- [ ] EF Core migration for Analytics tables generated
- [ ] SQL Server views script created
- [ ] `IWidgetDataSource` + implementations registered in DI
- [ ] `IReportService` + `DynamicQueryBuilder` registered in DI
- [ ] `IReportExportService` (CSV/PDF/Excel) registered in DI
- [ ] Hangfire jobs registered (ReportExecution, DailyRollup, WeeklyRollup, MonthlyRollup)
- [ ] Frontend `DashboardGrid.tsx`, widget components, report builder created
- [ ] New routes added to `App.tsx` and sidebar navigation
- [ ] Integration tests for all Phase 6 modules
