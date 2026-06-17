# Phase 5 — Financial & Compliance: Sprint Plan

**Timeline:** Weeks 14–18 (5 weeks @ 5 days = 25 working days)
**Status:** Greenfield — no existing Billing, Pricing, or Compliance code
**Dependency on Phase 4:** ServiceWorkflow (form builder, service requests, workflow engine), Projects (projects, work orders, cost centers, issues), and Inventory (items, vendors, purchase orders) modules are complete. Shared infrastructure (multi-tenancy, MediatR, FluentValidation, Serilog, MassTransit, Hangfire, Docker Compose, YARP Gateway) already in place.

---

## Architecture Decisions

### Service Boundary
Phase 5 introduces **two new microservices**, each following Clean Architecture (Domain, Application, Infrastructure, Api):

| Microservice | Modules | Rationale |
|-------------|---------|-----------|
| `Services/Billing/` | Invoicing + Pricing Models + ERP Integration | Tightly coupled: invoices use pricing models, ERP sync processes completed invoices |
| `Services/Compliance/` | Audit Logs + E-Signatures + Change Tracking | Regulatory scope with independent scaling and retention policies |

### Database Isolation
Each microservice gets its own DbContext with its own connection string:
- `BillingDbContext` → `BillingDb`
- `ComplianceDbContext` → `ComplianceDb`

Multi-tenancy enforced via `ITenantContext` + global query filter pattern (same as Phases 1–4).

### Invoice Numbering
Auto-generated format: `INV-{year}-{sequence:06}` (e.g., `INV-2026-000001`). Sequence tracked per tenant per year in an `InvoiceSequences` table.

### Pricing Strategy
- `PricingModels` define the rate structure (flat rate, tiered, time-based, quantity-based)
- `RateTables` store effective rates with date ranges
- Dual-rate support: Internal (academic/research) and External (commercial/industry)
- VAT/Tax Codes are multi-jurisdiction — rates are resolved by shipping/billing address country
- Rebates and membership credits are applied as line-item adjustments before tax

### ERP Integration Pattern
```
Invoice Approved → PendingERP → ErpSyncScheduled → ErpSent
                                                        ↓
                                                 ErpAcknowledged
                                                        ↓
                                                 ErpFailed (retry)
```
- Hangfire recurring job picks up `PendingERP` and `ErpFailed` invoices every 5 minutes
- Oracle Fusion SOAP/REST connector is pluggable via `IErpIntegrationService`
- Sync status + payload tracked in `ErpSyncLog` for audit

### Immutable Audit Log
- `AuditLogs` table uses SHA-256 hash chaining: each entry stores `PreviousHash` of the prior entry
- No deletes, no updates — append-only
- `IAuditService` logs all entity changes via an EF Core `SaveChangesInterceptor`
- Reason-for-change is a required field for any modification to critical entities (instruments, financial data, compliance records)

### E-Signature
- Captured as vector points (JSON array of `{x, y, pressure, timestamp}`)
- Stored with a SHA-256 hash of the signed document context
- Verified by re-computing the hash against stored value
- Compliance with UAE PDPL Article 14 (Electronic Signatures)

### Frontend Routing
New frontend modules:
- `modules/billing/` → `/billing/*`
- `modules/compliance/` → `/compliance/*`

---

## Scope Summary

| Area | Backend Tasks | Frontend Tasks | DB Tables | Est. Effort |
|------|:-------------:|:--------------:|-----------|:-----------:|
| Invoicing | 5.1, 5.2, 5.3, 5.4 | 5.17, 5.18, 5.19, 5.20 | `Invoices`, `InvoiceLineItems`, `InvoiceSequences` | 10 days |
| Pricing Models | 5.5, 5.6, 5.7, 5.8 | 5.21, 5.22, 5.23, 5.24 | `PricingModels`, `RateTables`, `Rebates`, `Credits`, `TaxCodes` | 8 days |
| ERP Integration | 5.9, 5.10 | 5.25 | `ErpSyncLog` | 5 days |
| Compliance (Audit) | 5.11, 5.12 | 5.26, 5.28 | `AuditLogs` | 5 days |
| E-Signatures | 5.13, 5.14 | 5.27 | `Signatures`, `ChangeRecords` | 3 days |
| Reports + Dashboard | 5.15 | 5.29, 5.30 | — (uses existing data) | 2 days |
| Integration Tests | 5.16 | — | — | 2 days |
| **Total** | **16 backend** | **14 frontend** | **12 tables** | **~35 days** |

---

## Sprint Breakdown

---

### Sprint 1 — Invoicing Engine (Days 1–7)

**Theme:** Invoice entity design, PDF generation engine, invoicing CRUD API, and all corresponding frontend pages.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 5.1 | Invoice entities + EF config | `Invoice`, `InvoiceLineItem` entities, `BillingDbContext` | **Invoice** fields: TenantId, InvoiceNumber (auto-generated `INV-{year}-{seq:06}`, unique per tenant), Status (Draft/Pending/Approved/Sent/Paid/Overdue/Voided/CreditNote), BilledToEntityType (ServiceRequest/Booking/Project/Monthly), BilledToEntityId, BillToName, BillToAddress, BillToEmail, Currency, Subtotal, DiscountAmount, TaxAmount, TotalAmount, AmountPaid, BalanceDue, InvoiceDate, DueDate, PaidAt, VoidedAt, VoidReason, CreatedAt, UpdatedAt. **InvoiceLineItem** fields: TenantId, InvoiceId, Description, Quantity, UnitPrice, DiscountPercent, TaxRate, LineTotal, ReferenceType, ReferenceId. Configuration maps to `Invoices` and `InvoiceLineItems` tables. `InvoiceSequences` table tracks per-tenant, per-year sequences. Register `BillingDbContext` in DI. |
| 5.2 | Invoice generation engine | `IInvoiceGenerationService` | Service that generates invoices from: (a) completed ServiceRequests (billable hours/materials), (b) completed Bookings (equipment usage × rate), (c) manual line items. Auto-calculates subtotal, tax (from applicable TaxCodes), discount, and total. Supports credit notes (negative invoice linked to original). Route: `/api/v1/billing/invoices/generate`. Generation can be preview (Draft status) or finalized. |
| 5.3 | Invoice CRUD API | `InvoicesController` | Standard REST: GET list (paginated, filterable by status/date range/customer), GET by id (with line items and payment history), POST create (manual invoice with line items), PUT update (Draft only), POST void (with reason, generates credit note if paid), POST send (marks Sent, triggers email via Phase 7 `INotificationService`). Routes: `/api/v1/billing/invoices`. FluentValidation for invoice creation (at least one line item, positive totals). |
| 5.4 | PDF invoice generation | `IInvoicePdfService` | Uses Razor templates to render HTML invoices, then converts to PDF via a library (e.g., DinkToPdf or QuestPDF). Template supports: company logo, bill-to address, line items table, subtotal/tax/total breakdown, payment terms, VAT summary. API: `GET /api/v1/billing/invoices/{id}/pdf` returns PDF byte stream. Caches generated PDF for 24 hours (regenerated if invoice status changes). |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 5.17 | Invoices List page | `billing/pages/invoices-list.tsx` — TanStack Table with status tabs (Draft/Pending/Approved/Sent/Paid/Overdue/Voided). Columns: invoice number (monospace, clickable), customer, status badge (color-coded), amount, date, due date, days overdue (red if overdue). Filters: status, date range, amount range, search by invoice number or customer name. Export to CSV. Action buttons: Create Invoice, Send (for Approved), Void. |
| 5.18 | Invoice Details page | `billing/pages/invoice-details.tsx` — Header card: invoice number, status badge, customer info. Line items table with quantity/unit price/discount/tax/line total. Totals section: subtotal, discount, tax, total, amount paid, balance due. Payment timeline. Action bar: Send, Download PDF, Record Payment, Void (with reason dialog). If generated from Booking/ServiceRequest, show link to source entity. |
| 5.19 | Invoice Create page (manual + from source) | `billing/pages/create-invoice.tsx` — Multi-step wizard: (1) Select source — "From Booking", "From Service Request", "From Project", or "Manual". Source selection opens a searchable picker filtered by the user's tenant. (2) Line items — auto-populated from source (if applicable) with editable quantities/rates. Add manual line items. (3) Apply discounts and select TaxCode. (4) Review & Save as Draft or Approve. Shows real-time total calculation. |
| 5.20 | Invoice PDF preview + download | `billing/components/invoice-pdf-preview.tsx` — Embedded PDF viewer in the invoice details page (using iframe or PDF.js). Download button. Generates via `GET /api/v1/billing/invoices/{id}/pdf`. Refresh button that regenerates the PDF. |

**Sprint 1 Deliverables:** `Invoices` + `InvoiceLineItems` + `InvoiceSequences` tables, Invoice CRUD API, invoice generation engine (from bookings/requests/manual), PDF invoice service, invoices list/details/create pages, PDF preview.

---

### Sprint 2 — Pricing Models & ERP Integration (Days 8–13)

**Theme:** Flexible pricing engine, VAT/tax management, rebates/credits, Oracle Fusion ERP connector.

#### Backend Tasks — `Services/Billing/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 5.5 | Pricing Model engine | `PricingModel` entity, `IPricingService` | **PricingModel** fields: TenantId, Name, Description, ModelType (FlatRate/PerUnit/Tiered/TimeBased/Member), EffectiveFrom, EffectiveTo, IsActive, CreatedAt. API: CRUD for pricing models. `IPricingService.CalculatePrice(modelId, quantity, duration, customerType, context)` — evaluates the model and returns a `PriceBreakdown` (line items with unit price, discounts, total). FlatRate: single price. PerUnit: price × quantity. Tiered: quantity brackets with different rates. TimeBased: rate × duration (hours/days). Member: special rate for members with credit. Route: `/api/v1/billing/pricing-models`. |
| 5.6 | Internal vs External rate support | `RateTable` entity, dual-rate evaluation | **RateTable** fields: TenantId, PricingModelId, CustomerType (Internal/External), Rate (decimal), MinQuantity, MaxQuantity, EffectiveFrom, EffectiveTo. When calculating price, `IPricingService` first resolves the customer type (based on the institution's subscription tier), then looks up the applicable rate table. Internal rates are typically 40-60% of external. API: CRUD for rate tables. Route: `/api/v1/billing/rate-tables`. |
| 5.7 | Rebate + Membership credit system | `Rebate`, `Credit` entities, API | **Rebate** fields: TenantId, Name, Description, RebateType (Percentage/Fixed/Volume), Value, MinSpendAmount (to qualify), MaxDiscountAmount (cap), IsActive, ValidFrom, ValidTo. **Credit** fields: TenantId, InstitutionId, Balance (decimal), Currency, LastUpdated. Rebates are applied automatically during invoice calculation if conditions are met. Credits can be manually applied or auto-apply monthly membership credits. API: CRUD for rebates, GET/POST credits (admin adjust balance), GET credit balance for customer. Route: `/api/v1/billing/rebates`, `/api/v1/billing/credits`. |
| 5.8 | VAT/Tax code management | `TaxCode` entity, tax calculation service | **TaxCode** fields: TenantId, Name (e.g., "VAT 5%"), Description, Country (ISO code), Region (optional state/province), Rate (decimal, e.g., 0.05), IsDefault, IsCompound (applies on top of other taxes), EffectiveFrom, EffectiveTo. Tax calculation: during invoice generation, resolve applicable TaxCodes based on billing address country. Apply each tax sequentially (compound taxes stack). API: CRUD for tax codes. Route: `/api/v1/billing/tax-codes`. |
| 5.9 | Oracle Fusion ERP integration connector | `IErpIntegrationService` | Interface: `Task<ErpSyncResult> SendInvoiceAsync(Invoice invoice)`, `Task<ErpSyncResult> CheckStatusAsync(string externalId)`, `Task<ErpSyncResult> CreditNoteAsync(Invoice creditNote)`. Default implementation: `OracleFusionErpService` — maps invoice data to Oracle Fusion XML/SOAP envelope, sends via HTTP, parses response. `ErpSyncLog` fields: TenantId, InvoiceId, Direction (Outbound/Inbound), Status (Pending/Sent/Acknowledged/Failed), RequestPayload, ResponsePayload, ErrorMessage, AttemptCount, LastAttemptedAt, CreatedAt. Mock implementation for dev/test. |
| 5.10 | ERP posting workflow + Hangfire job | Hangfire recurring job, posting service | `InvoicePostedToErpEvent` published via MassTransit when ERP acknowledges. Hangfire job `ErpSyncJob` runs every 5 minutes: queries invoices with Status = Approved and ErpSyncStatus != ErpAcknowledged, calls `IErpIntegrationService.SendInvoiceAsync()`, updates ErpSyncLog. Retry up to 5 times with exponential backoff, then flags as failed with alert. Manual retry button on ERP sync dashboard. Route: `POST /api/v1/billing/invoices/{id}/resync-erp`. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 5.21 | Pricing Model configuration page | `billing/pages/pricing-models-page.tsx` — List of pricing models with status toggle. Create/edit dialog: name, description, model type selector (Flat/PerUnit/Tiered/TimeBased). Dynamic form changes based on type: for Tiered, add quantity bracket rows. For TimeBased, select duration unit. Effective date range picker. Table of attached rate tables (internal/external) at the bottom of the detail view. |
| 5.22 | Internal/External rate editor | `billing/components/rate-editor.tsx` — Side-by-side comparison table: column for Internal rate, column for External rate, rows are quantity brackets (or duration brackets). Inline editing. Auto-suggest internal as 50% of external (configurable). Validation: external >= internal, rates >= 0. |
| 5.23 | Rebate + Credit management pages | `billing/pages/rebates-page.tsx`, `billing/pages/credits-page.tsx` — Rebates list: name, type (%, fixed), value, min spend, cap, validity. Create/edit dialog. Credits page: search by institution, view current balance, adjustment log (add/deduct with reason), manual credit adjustment dialog (admin only). |
| 5.24 | Tax code configuration page | `billing/pages/tax-codes-page.tsx` — Table of tax codes with country flag, region, rate %, effective dates. Create/edit dialog: name, country (ISO dropdown), region, rate, compound toggle, default toggle. Validate no overlapping effective dates for same country. Warning if no default tax code set. |
| 5.25 | ERP sync status dashboard | `billing/pages/erp-sync-dashboard.tsx` — KPI cards: total pending, failed (red), synced today. Table of recent sync attempts: invoice number, direction, status (color-coded), attempt count, last attempted, error message (expandable). Action buttons: Retry (single), Retry All Failed, View Invoice. Auto-refresh every 30 seconds. |

**Sprint 2 Deliverables:** `PricingModels` + `RateTables` + `Rebates` + `Credits` + `TaxCodes` + `ErpSyncLog` tables, pricing calculation engine, dual-rate system, rebate/credit application, tax code resolution, Oracle Fusion ERP connector, Hangfire ERP sync job, pricing model/rate editor/rebate/tax/ERP dashboard pages.

---

### Sprint 3 — Compliance & Audit (Days 14–19)

**Theme:** Immutable audit log with hash-chain, e-signature capture and verification, reason-for-change tracking.

#### Backend Tasks — `Services/Compliance/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 5.11 | Immutable Audit Log — entity + EF config | `AuditLogEntry` entity, `ComplianceDbContext` | **AuditLogEntry** fields: TenantId, EntityType (string — table name), EntityId (Guid), Operation (Create/Update/Delete), PreviousValues (nvarchar(max) — JSON of old values), NewValues (nvarchar(max) — JSON of new values), ChangedByUserId, ChangedByUserName, ChangeReason (required string), IpAddress, UserAgent, Timestamp, PreviousHash (string — SHA-256 of previous entry), CurrentHash (string — SHA-256 of `PreviousHash + Timestamp + EntityType + EntityId + Operation + NewValues`). Hash chain: each entry links to the SHA-256 of the prior entry. Configuration maps to `AuditLogs` table with composite index on (TenantId, EntityType, EntityId, Timestamp). Register `ComplianceDbContext` in DI. |
| 5.12 | Audit log service + query/export API | `IAuditService`, `AuditController` | `IAuditService.LogAsync(entry)` — creates entry, computes hash chain, persists. `SaveChangesInterceptor` auto-logs changes to all entities marked with `[Auditable]` attribute. Requires `ChangeReason` from `ITenantContext` (set via frontend dialog). `AuditController`: GET list (paginated, filterable by entity type, entity ID, user, date range, operation), GET by id (shows full entry with hash chain verification), GET verify-chain (re-computes hashes and reports any tampered entries), GET export (CSV/PDF). Route: `/api/v1/compliance/audit-logs`. Integrity verification endpoint computes hash chain and reports discrepancies. |
| 5.13 | E-Signature service | `Signature` entity, `ISignatureService` | **Signature** fields: TenantId, SignedEntityType, SignedEntityId, SignerUserId, SignerName, SignerEmail, SignatureData (nvarchar(max) — JSON array of `{x, y, pressure, timestamp}` points), DocumentHash (SHA-256 of signed document context), SignedAt, IpAddress. `ISignatureService.CaptureAsync(signerId, entityType, entityId, signatureData, documentContext)` — stores capture + computes hash. `ISignatureService.VerifyAsync(signatureId, documentContext)` — re-computes hash and compares. API: POST capture signature, GET verify, GET signatures for entity. Route: `/api/v1/compliance/signatures`. |
| 5.14 | Reason-for-change tracking | Change tracking interceptor + API | `IChangeTrackingService` — lightweight wrapper around `IAuditService` that specifically captures reason-for-change. When an auditable entity is modified, the caller must supply a `ChangeReason` string. The EF Core interceptor checks for this via `ITenantContext.CurrentChangeReason` and throws if empty for critical entity types (configurable list: Instrument, Invoice, PricingModel, etc.). API: `GET /api/v1/compliance/change-history?entityType=...&entityId=...` — returns filtered audit log entries for that entity. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 5.26 | Audit Log viewer | `compliance/pages/audit-logs-page.tsx` — Filter bar: entity type (dropdown of registered auditable types), entity ID (auto-complete), user, date range, operation type. Results table: timestamp, user, operation (color-coded create=green, update=amber, delete=red), entity type, entity ID, change reason. Expand row to show previous/new values diff (JSON diff viewer). Chain integrity indicator: green checkmark if hash valid, red X if tampered. Export button (CSV). Detail view: full entry with hash values, link to previous/next entry in chain. |
| 5.27 | E-Signature capture dialog | `compliance/components/signature-pad.tsx` — Canvas-based signature capture component. Features: mouse/touch drawing, pressure sensitivity (if available), clear button, accept button. Preview of signed signature. Input for signer name and title (auto-filled from current user). Display stored signature as SVG path rendering. Used in: custody transfer (Phase 2), invoice approval, compliance document signing. Reusable component exported from `compliance/components/signature-pad.tsx` for other modules. |
| 5.28 | Change history component (reusable) | `compliance/components/change-history.tsx` — Reusable component that accepts `entityType` and `entityId` props and renders a timeline of changes. Each entry: timestamp, user avatar + name, operation type icon, change reason snippet. Expand to show field-level diff (highlighted green for added, red for removed). Used inline on entity detail pages (instrument details, invoice details, etc.). Accepts optional `maxItems` prop for compact view with "Show all" link. |

**Sprint 3 Deliverables:** `AuditLogs` + `Signatures` tables, immutable audit log with SHA-256 hash chain, EF Core auto-logging interceptor, audit query/export/verify API, e-signature capture/verify API, reason-for-change enforcement, audit log viewer, signature pad component, change history reusable component.

---

### Sprint 4 — Financial Reports, Dashboard & Integration Tests (Days 20–25)

**Theme:** Asset depreciation reports, financial dashboard, integration tests across both new services, Docker Compose + Gateway setup.

#### Backend Tasks — `Services/Billing/` + `Services/Compliance/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 5.15 | Asset Value + Depreciation reports | `AssetReportController` | Endpoints that aggregate data from the existing Facility microservice (Assets, Instruments). Depreciation report: `GET /api/v1/billing/reports/asset-depreciation` — query params: date range, asset category, depreciation method. Returns total asset value, accumulated depreciation, net book value by category, monthly depreciation trends. Does not duplicate depreciation logic from Phase 2 — queries the already-calculated depreciation values from `Assets` table. Asset value report: `GET /api/v1/billing/reports/asset-valuation` — current replacement value, insured value, written-down value by location/category. Route: `/api/v1/billing/reports/*`. |
| 5.16 | Integration tests for all Phase 5 modules | xUnit + Testcontainers tests | Create `BillingWebApplicationFactory` and `ComplianceWebApplicationFactory`. Tests: Invoice CRUD + status transitions, invoice generation from booking/request, PDF generation returns valid PDF bytes, pricing model calculation (flat/tiered/time-based), dual-rate resolution, rebate application, credit balance adjustment, tax code resolution by country, ERP sync log creation + retry logic, audit log creation with hash chain integrity, e-signature capture + verify, change history filtered by entity type/id, report endpoint returns correct aggregations. Minimum 4 test classes per microservice (8 total). Use Testcontainers for SQL Server. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 5.29 | Asset Depreciation report page | `billing/pages/depreciation-reports.tsx` — Date range selector. Bar chart: net book value by category (stacked: cost - depreciation = NBV). Table below: asset name, category, purchase date, cost, accumulated depreciation, NBV, depreciation method. Export to CSV. Filter by category and location. |
| 5.30 | Financial Dashboard | `billing/pages/financial-dashboard.tsx` — Route: `/billing`. KPI cards row: Total Revenue (month), Outstanding Receivables, Overdue Amount, Avg Days to Pay. Charts: Revenue by month (bar chart with current vs previous year overlay), Revenue by category (pie chart — equipment usage, service requests, consumables), Outstanding by aging bucket (0-30, 31-60, 61-90, 90+ days). Recent transactions feed (last 10 invoices created/paid). Quick actions: Create Invoice, View ERP Sync Status. Data aggregate across all billing entities. |

#### Operations Tasks

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| — | Docker Compose — add services | `docker-compose.yml` update | Add `billing-api` (port 5008) and `compliance-api` (port 5009) services following the existing `inventory-api` pattern. Each with its own connection string, depends_on sqlserver + rabbitmq, healthcheck. Add log volumes. |
| — | YARP Gateway — add routing entries | Gateway `appsettings.json` update | Add `billing-route` (Path: `/api/v1/billing/{**catch-all}` → cluster `billing-cluster` → `http://localhost:5008/`) and `compliance-route` (Path: `/api/v1/compliance/{**catch-all}` → cluster `compliance-cluster` → `http://localhost:5009/`). |
| — | Solution folder + project scaffolding | `ResearchLms.slnx` update | Create `Services/Billing/` and `Services/Compliance/` solution folders with the 4-project Clean Architecture structure (Domain, Application, Infrastructure, Api). Follow same `.csproj` patterns as existing services. |
| — | EF Core migrations | Initial migrations | `dotnet ef migrations add Billing_Initial --project Services/Billing/ResearchLms.Billing.Infrastructure` and `Compliance_Initial` for Compliance. `dotnet ef database update` for both. |
| — | Frontend scaffolding | Module folders + routes | Create `frontend/src/modules/billing/` and `frontend/src/modules/compliance/` with `pages/` and `components/` subfolders. Add routes to `App.tsx`. Add sidebar entries for billing under the Financial section. |

**Sprint 4 Deliverables:** Asset depreciation reports API + page, financial dashboard, integration tests (8 test classes), Docker Compose entries for billing-api (port 5008) and compliance-api (port 5009), YARP Gateway routes, solution scaffolding, EF Core migrations, frontend module scaffolding.

---

## New Service Structures

### `Services/Billing/`

```
backend/Services/Billing/
├── ResearchLms.Billing.Domain/
│   ├── Entities/
│   │   ├── Invoice.cs
│   │   ├── InvoiceLineItem.cs
│   │   ├── InvoiceSequence.cs
│   │   ├── PricingModel.cs
│   │   ├── RateTable.cs
│   │   ├── Rebate.cs
│   │   ├── Credit.cs
│   │   ├── TaxCode.cs
│   │   └── ErpSyncLog.cs
│   ├── Enums/
│   │   ├── InvoiceStatus.cs
│   │   ├── PricingModelType.cs
│   │   ├── CustomerType.cs
│   │   └── ErpSyncStatus.cs
│   ├── ValueObjects/
│   │   ├── PriceBreakdown.cs
│   │   ├── Money.cs
│   │   └── Address.cs
│   └── Interfaces/
│       ├── IInvoiceRepository.cs
│       ├── IInvoiceGenerationService.cs
│       ├── IInvoicePdfService.cs
│       ├── IPricingService.cs
│       ├── IRateTableRepository.cs
│       ├── ITaxService.cs
│       ├── IRebateService.cs
│       ├── ICreditRepository.cs
│       └── IErpIntegrationService.cs
├── ResearchLms.Billing.Application/
│   ├── Commands/
│   │   ├── Invoices/
│   │   │   ├── CreateInvoiceCommand.cs
│   │   │   ├── UpdateInvoiceCommand.cs
│   │   │   ├── VoidInvoiceCommand.cs
│   │   │   ├── SendInvoiceCommand.cs
│   │   │   └── RecordPaymentCommand.cs
│   │   ├── Pricing/
│   │   │   ├── CreatePricingModelCommand.cs
│   │   │   ├── UpdatePricingModelCommand.cs
│   │   │   └── SetRateTableCommand.cs
│   │   └── Erp/
│   │       └── RetryErpSyncCommand.cs
│   ├── Queries/
│   │   ├── Invoices/
│   │   │   ├── GetInvoicesQuery.cs
│   │   │   ├── GetInvoiceByIdQuery.cs
│   │   │   └── GetInvoicePdfQuery.cs
│   │   ├── Pricing/
│   │   │   ├── GetPricingModelsQuery.cs
│   │   │   ├── CalculatePriceQuery.cs
│   │   │   └── GetTaxCodesQuery.cs
│   │   └── Reports/
│   │       ├── GetAssetDepreciationReportQuery.cs
│   │       └── GetFinancialDashboardQuery.cs
│   ├── DTOs/
│   │   ├── InvoiceDto.cs
│   │   ├── InvoiceLineItemDto.cs
│   │   ├── PricingModelDto.cs
│   │   ├── PriceBreakdownDto.cs
│   │   ├── RebateDto.cs
│   │   ├── CreditDto.cs
│   │   ├── TaxCodeDto.cs
│   │   ├── ErpSyncLogDto.cs
│   │   └── FinancialDashboardDto.cs
│   ├── Validators/
│   │   ├── CreateInvoiceValidator.cs
│   │   ├── CreatePricingModelValidator.cs
│   │   └── CreateTaxCodeValidator.cs
│   ├── EventHandlers/
│   │   └── InvoiceApprovedEventHandler.cs
│   └── DependencyInjection.cs
├── ResearchLms.Billing.Infrastructure/
│   ├── Persistence/
│   │   ├── BillingDbContext.cs
│   │   └── EntityConfigurations/
│   │       ├── InvoiceConfiguration.cs
│   │       ├── InvoiceLineItemConfiguration.cs
│   │       ├── PricingModelConfiguration.cs
│   │       ├── RateTableConfiguration.cs
│   │       ├── RebateConfiguration.cs
│   │       ├── CreditConfiguration.cs
│   │       ├── TaxCodeConfiguration.cs
│   │       └── ErpSyncLogConfiguration.cs
│   ├── Services/
│   │   ├── InvoiceGenerationService.cs
│   │   ├── InvoicePdfService.cs
│   │   ├── PricingService.cs
│   │   ├── TaxService.cs
│   │   ├── RebateService.cs
│   │   └── OracleFusionErpService.cs
│   ├── BackgroundJobs/
│   │   └── ErpSyncJob.cs
│   └── DependencyInjection.cs
└── ResearchLms.Billing.Api/
    ├── Controllers/
    │   ├── InvoicesController.cs
    │   ├── PricingModelsController.cs
    │   ├── RateTablesController.cs
    │   ├── RebatesController.cs
    │   ├── CreditsController.cs
    │   ├── TaxCodesController.cs
    │   ├── ErpSyncController.cs
    │   └── ReportsController.cs
    ├── Middleware/
    └── Program.cs
```

### `Services/Compliance/`

```
backend/Services/Compliance/
├── ResearchLms.Compliance.Domain/
│   ├── Entities/
│   │   ├── AuditLogEntry.cs
│   │   └── Signature.cs
│   ├── ValueObjects/
│   │   ├── SignaturePoint.cs
│   │   └── HashChainResult.cs
│   └── Interfaces/
│       ├── IAuditService.cs
│       ├── IAuditLogRepository.cs
│       ├── ISignatureService.cs
│       ├── ISignatureRepository.cs
│       └── IChangeTrackingService.cs
├── ResearchLms.Compliance.Application/
│   ├── Commands/
│   │   ├── CaptureSignatureCommand.cs
│   │   └── VerifySignatureCommand.cs
│   ├── Queries/
│   │   ├── GetAuditLogsQuery.cs
│   │   ├── GetAuditLogByIdQuery.cs
│   │   ├── VerifyAuditChainQuery.cs
│   │   └── GetSignaturesForEntityQuery.cs
│   ├── DTOs/
│   │   ├── AuditLogEntryDto.cs
│   │   └── SignatureDto.cs
│   ├── Validators/
│   │   └── CaptureSignatureValidator.cs
│   └── DependencyInjection.cs
├── ResearchLms.Compliance.Infrastructure/
│   ├── Persistence/
│   │   ├── ComplianceDbContext.cs
│   │   └── EntityConfigurations/
│   │       ├── AuditLogEntryConfiguration.cs
│   │       └── SignatureConfiguration.cs
│   ├── Services/
│   │   ├── AuditService.cs
│   │   ├── AuditSaveChangesInterceptor.cs
│   │   └── SignatureService.cs
│   └── DependencyInjection.cs
└── ResearchLms.Compliance.Api/
    ├── Controllers/
    │   ├── AuditLogsController.cs
    │   └── SignaturesController.cs
    ├── Middleware/
    └── Program.cs
```

---

## Frontend Module Structure

```
frontend/src/modules/
├── billing/
│   ├── pages/
│   │   ├── financial-dashboard.tsx
│   │   ├── invoices-list.tsx
│   │   ├── invoice-details.tsx
│   │   ├── create-invoice.tsx
│   │   ├── pricing-models-page.tsx
│   │   ├── rebates-page.tsx
│   │   ├── credits-page.tsx
│   │   ├── tax-codes-page.tsx
│   │   ├── erp-sync-dashboard.tsx
│   │   └── depreciation-reports.tsx
│   └── components/
│       ├── invoice-pdf-preview.tsx
│       ├── rate-editor.tsx
│       ├── invoice-status-badge.tsx
│       └── erp-sync-status-badge.tsx
├── compliance/
│   ├── pages/
│   │   └── audit-logs-page.tsx
│   └── components/
│       ├── signature-pad.tsx
│       └── change-history.tsx
```

---

## API Routes

### Billing

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| GET | `/api/v1/billing/invoices` | Invoices | List (paginated, filterable by status/date/customer) |
| GET | `/api/v1/billing/invoices/{id}` | Invoices | Get by ID (with line items) |
| POST | `/api/v1/billing/invoices` | Invoices | Create (manual or from source) |
| PUT | `/api/v1/billing/invoices/{id}` | Invoices | Update (Draft only) |
| POST | `/api/v1/billing/invoices/{id}/send` | Invoices | Send (Draft/Pending → Sent) |
| POST | `/api/v1/billing/invoices/{id}/void` | Invoices | Void with reason |
| GET | `/api/v1/billing/invoices/{id}/pdf` | Invoices | Download PDF |
| POST | `/api/v1/billing/invoices/generate` | Invoices | Generate from source |
| GET | `/api/v1/billing/pricing-models` | PricingModels | List |
| POST | `/api/v1/billing/pricing-models` | PricingModels | Create |
| PUT | `/api/v1/billing/pricing-models/{id}` | PricingModels | Update |
| GET | `/api/v1/billing/rate-tables` | RateTables | List by model |
| POST | `/api/v1/billing/rate-tables` | RateTables | Create rate entry |
| PUT | `/api/v1/billing/rate-tables/{id}` | RateTables | Update rate entry |
| POST | `/api/v1/billing/pricing/calculate` | PricingModels | Calculate price (query params) |
| GET | `/api/v1/billing/rebates` | Rebates | List |
| POST | `/api/v1/billing/rebates` | Rebates | Create |
| PUT | `/api/v1/billing/rebates/{id}` | Rebates | Update |
| GET | `/api/v1/billing/credits` | Credits | List by institution |
| POST | `/api/v1/billing/credits/adjust` | Credits | Admin adjust credit balance |
| GET | `/api/v1/billing/tax-codes` | TaxCodes | List |
| POST | `/api/v1/billing/tax-codes` | TaxCodes | Create |
| PUT | `/api/v1/billing/tax-codes/{id}` | TaxCodes | Update |
| GET | `/api/v1/billing/erp-sync` | ErpSync | Sync log list |
| GET | `/api/v1/billing/erp-sync/{invoiceId}` | ErpSync | Sync status for invoice |
| POST | `/api/v1/billing/invoices/{id}/resync-erp` | ErpSync | Manual retry |
| GET | `/api/v1/billing/reports/asset-depreciation` | Reports | Depreciation report |
| GET | `/api/v1/billing/reports/asset-valuation` | Reports | Asset valuation report |
| GET | `/api/v1/billing/dashboard` | Reports | Financial dashboard data |

### Compliance

| Method | Route | Controller | Action |
|--------|-------|-----------|--------|
| GET | `/api/v1/compliance/audit-logs` | AuditLogs | List (paginated, filterable) |
| GET | `/api/v1/compliance/audit-logs/{id}` | AuditLogs | Get by ID (with hashes) |
| GET | `/api/v1/compliance/audit-logs/verify-chain` | AuditLogs | Verify hash chain integrity |
| GET | `/api/v1/compliance/audit-logs/export` | AuditLogs | Export CSV/PDF |
| GET | `/api/v1/compliance/change-history` | AuditLogs | Change history for entity |
| POST | `/api/v1/compliance/signatures` | Signatures | Capture signature |
| GET | `/api/v1/compliance/signatures/{id}/verify` | Signatures | Verify signature |
| GET | `/api/v1/compliance/signatures` | Signatures | List signatures for entity |

---

## DB Schema (New Tables)

### Billing Database (`BillingDb`)

| Table | Key Columns | Notes |
|-------|------------|-------|
| `Invoices` | TenantId, InvoiceNumber (unique/tenant), Status, BilledToEntityType, BilledToEntityId, BillToName, BillToAddress, BillToEmail, Currency, Subtotal, DiscountAmount, TaxAmount, TotalAmount, AmountPaid, BalanceDue, InvoiceDate, DueDate, PaidAt, VoidedAt, VoidReason, ErpSyncStatus, CreatedAt, UpdatedAt | Status machine: Draft → Pending → Approved → Sent → Paid / Overdue; Approved → Voided (if unpaid) |
| `InvoiceLineItems` | TenantId, InvoiceId, Description, Quantity, UnitPrice, DiscountPercent, TaxRate, LineTotal, ReferenceType, ReferenceId | FK → Invoices with cascade delete |
| `InvoiceSequences` | TenantId, Year, LastSequence | Row per tenant per year, atomic increment |
| `PricingModels` | TenantId, Name, Description, ModelType, EffectiveFrom, EffectiveTo, IsActive | Type: FlatRate / PerUnit / Tiered / TimeBased |
| `RateTables` | TenantId, PricingModelId, CustomerType, Rate, MinQuantity, MaxQuantity, EffectiveFrom, EffectiveTo | FK → PricingModels |
| `Rebates` | TenantId, Name, Description, RebateType, Value, MinSpendAmount, MaxDiscountAmount, IsActive, ValidFrom, ValidTo | Applied automatically during pricing |
| `Credits` | TenantId, InstitutionId, Balance, Currency, LastUpdated | One row per institution |
| `TaxCodes` | TenantId, Name, Description, Country, Region, Rate, IsDefault, IsCompound, EffectiveFrom, EffectiveTo | Multi-jurisdiction support |
| `ErpSyncLog` | TenantId, InvoiceId, Direction, Status, RequestPayload (nvarchar(max)), ResponsePayload (nvarchar(max)), ErrorMessage, AttemptCount, LastAttemptedAt | Append-only sync log |

### Compliance Database (`ComplianceDb`)

| Table | Key Columns | Notes |
|-------|------------|-------|
| `AuditLogs` | TenantId, EntityType, EntityId, Operation, PreviousValues (nvarchar(max)), NewValues (nvarchar(max)), ChangedByUserId, ChangedByUserName, ChangeReason, IpAddress, UserAgent, Timestamp, PreviousHash, CurrentHash | SHA-256 hash chain; indexed on (TenantId, EntityType, EntityId, Timestamp) |
| `Signatures` | TenantId, SignedEntityType, SignedEntityId, SignerUserId, SignerName, SignerEmail, SignatureData (nvarchar(max)), DocumentHash, SignedAt, IpAddress | Signature stored as vector points JSON |

---

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Oracle Fusion ERP API not available for dev/test | High | Build `IErpIntegrationService` with a mock implementation that simulates success/failure responses. Real connector documented for production deployment. |
| PDF generation from Razor templates can be fragile | Medium | Use QuestPDF (fluent API, no external dependencies) instead of DinkToPdf (requires wkhtmltopdf binary). QuestPDF is pure .NET and works cross-platform. |
| Hash-chain integrity is critical for compliance | High | Verification endpoint re-computes full chain on demand. Add a daily Hangfire job that verifies chain integrity and alerts on tampering. Unit tests compare computed hash chain against known-good fixtures. |
| VAT/tax code complexity across jurisdictions | Medium | Start with single-rate VAT (UAE standard 5%). Multi-jurisdiction support is config-driven via `TaxCodes` table with country-level rate resolution. Compound tax support added but optional. |
| Invoice generation from bookings/requests depends on Phase 4 | Medium | Cross-service queries go through MassTransit events or direct HTTP calls (service-to-service via internal network). If Phase 4 APIs aren't stable, manual invoice creation is always available. |
| E-signature legal acceptance varies by jurisdiction | Low | Signature is captured as biometric vector data with document hash, meeting UAE PDPL Article 14 requirements. Legal disclaimer displayed before capture. Audit trail links signature to user session. |
| Two new microservices add DevOps complexity | Medium | Both follow identical patterns to existing services. Added in consecutive sprints (Billing in Sprint 1, Compliance in Sprint 3). Docker Compose and Gateway entries added in Sprint 4. |

---

## Phase 4 → Phase 5 Handoff Checklist

- [x] Phase 4 modules complete: ServiceWorkflow, Projects, Inventory
- [x] Shared infrastructure (multi-tenancy, MassTransit, Hangfire) operational
- [x] Docker Compose running all Phase 1-4 services
- [x] YARP Gateway routing all Phase 1-4 routes
- [x] Frontend routing infrastructure in place (App.tsx, sidebar, shared components)
- [ ] New `Services/Billing/` solution folder created
- [ ] New `Services/Compliance/` solution folder created
- [ ] `BillingDbContext` registered in DI
- [ ] `ComplianceDbContext` registered in DI
- [ ] `ConnectionStrings__BillingDb` and `ConnectionStrings__ComplianceDb` in `appsettings.json`
- [ ] `billing-api` and `compliance-api` added to Docker Compose
- [ ] `billing-route` and `compliance-route` added to YARP Gateway
- [ ] Frontend `modules/billing/` and `modules/compliance/` folders created
- [ ] Billing and Compliance routes added to `App.tsx`
- [ ] Permission strings for Phase 5 modules added to seed data
- [ ] Integration test projects created for both services
