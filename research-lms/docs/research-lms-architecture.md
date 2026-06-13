# Research LMS — Architecture Document

**Based on:** SOW Requirements (Research Laboratory Management System)  
**Frontend Reference:** Existing `lims-frontend` (Pathology LIMS — patterns to reuse)  
**Status:** Target Architecture v1.0  
**Date:** 2026-06-13

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Module Map (SOW → System)](#6-module-map-sow--system)
7. [Data Architecture](#7-data-architecture)
8. [Integration Architecture](#8-integration-architecture)
9. [Security Architecture](#9-security-architecture)
10. [AI/ML Architecture (M1-M7)](#10-aiml-architecture-m1-m7)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Folder Structure](#12-folder-structure)
13. [API Design](#13-api-design)
14. [Technology Stack Summary](#14-technology-stack-summary)
15. [Implementation Roadmap](#15-implementation-roadmap)

---

## 1. System Overview

### What We're Building

An enterprise-grade **Research Laboratory Management System (LMS)** for managing:

- **Facilities & Equipment** — Instruments, assets, rooms, core facilities across multiple institutions
- **Users & Access** — Multi-institution federation, SSO, RBAC/ABAC, SCIM provisioning
- **Operations & Scheduling** — Online scheduler, sample/service requests, workflow engine, project management
- **Financial & Compliance** — ERP-integrated billing, pricing models, immutable audit trails, e-signatures
- **Analytics & BI** — Configurable dashboards, drag-and-drop widgets, ad-hoc reporting, "Instrument 365 View"
- **Communication & Training** — Training module, announcements, notification center, help/support
- **AI Modules (M1-M7)** — Helpdesk, conversational orchestration, IoT integration, predictive maintenance, planning/optimization, self-evolution
- **Integrations** — Entra ID, SCIM, Outlook/Google Calendar, Oracle Fusion ERP, ServiceNow/Jira, IoT/OT protocols

### Key Differentiators from Existing LIMS Frontend

| Aspect | Existing (Pathology LIMS) | New (Research LMS) |
|--------|--------------------------|-------------------|
| **Domain** | Clinical diagnostic lab | Research/core facilities |
| **Primary Entities** | Patients, tests, samples, results | Equipment, instruments, researchers, schedules |
| **Workflows** | Sample collection → result → report | Equipment booking → usage → maintenance → billing |
| **Users** | Patients, doctors, technicians, pathologists | Researchers, PIs, lab admins, facility managers, technicians |
| **AI** | Mock AI features page | 7 dedicated AI modules (M1-M7) |
| **Integrations** | None | Entra ID, SCIM, ERP, IoT, Calendar, Ticketing |

---

## 2. Architecture Principles

1. **API-First & Modular** — Microservices architecture; all functions exposed via REST/GraphQL APIs; webhooks/events for downstream systems
2. **MCP-Compliant** — Native support for Model Context Protocol (server + client modes); secure tool calling; structured context retrieval; full auditability of AI-driven actions
3. **Multi-Tenant by Design** — Every service is tenant-aware; data isolation at database level; tenant provisioning/de-provisioning as first-class operations
4. **Cloud-Native** — Containerized microservices; Kubernetes orchestration; horizontal scaling; CI/CD pipelines
5. **Security by Design** — Zero-trust network; RBAC + ABAC; AES-256 at rest, TLS 1.2+ in transit; immutable audit logs; MFA; conditional access
6. **IoT-Ready** — OPC-UA/MQTT/Modbus ingestion pipeline; real-time sensor data; threshold-based alerts
7. **AI-Ready** — Structured schemas with provenance metadata; versioning; MCP tool definitions; queryable audit trails for AI actions
8. **Accessibility** — WCAG 2.2 AA compliant web interface; iOS/Android native apps; offline SOP access; MDM/Intune support

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                     │
├─────────────────┬─────────────────┬──────────────────┬──────────────────────┤
│   React Web App │   iOS Native    │  Android Native   │    MCP Client SDK    │
│  (ShadCN/Tail.) │   (SwiftUI)     │    (Jetpack)      │   (3rd-party agent)  │
└────────┬────────┴────────┬────────┴────────┬─────────┴──────────┬───────────┘
         │                 │                  │                    │
         │           HTTPS/WSS (TLS 1.2+)     │              MCP over WSS
         ▼                 ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Kong / APISIX)                        │
│              Rate Limiting · Auth · Routing · Load Balancing               │
│                          MCP Gateway Plugin                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    MICROSERVICES LAYER                               │  │
│  ├────────────┬───────────┬───────────┬──────────┬──────────┬──────────┤  │
│  │ Auth &     │ Facility &│ Booking & │ Financial│ Analytics│ AI       │  │
│  │ Identity   │ Equipment │ Scheduling│ & Billing│ & BI     │ Modules  │  │
│  │ Service    │ Mgmt Svc  │ Service   │ Service  │ Service  │ Service  │  │
│  ├────────────┼───────────┼───────────┼──────────┼──────────┼──────────┤  │
│  │ User &     │ Workflow  │ Inventory │ Notific. │ Training │ Integrat.│  │
│  │ Role Svc   │ Engine    │ Svc       │ Svc      │ Svc      │ Gateway  │  │
│  └────────────┴───────────┴───────────┴──────────┴──────────┴──────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      EVENT BUS (Kafka / RabbitMQ)                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                   DATA LAYER                                         │  │
│  ├──────────────────┬────────────────────┬─────────────────────────────┤  │
│  │  PostgreSQL      │  TimescaleDB       │  Redis                      │  │
│  │  (Primary DB)    │  (Time-series)     │  (Cache / Sessions / Queue) │  │
│  ├──────────────────┼────────────────────┼─────────────────────────────┤  │
│  │  MinIO / S3      │  Elasticsearch     │  Neo4j (optional)           │  │
│  │  (File Storage)  │  (Search / Logs)   │  (Asset relationships)      │  │
│  └──────────────────┴────────────────────┴─────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
    ▲           ▲           ▲            ▲            ▲            ▲
    │           │           │            │            │            │
┌───┴───┐  ┌───┴───┐  ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐
│Entra  │  │Oracle │  │Service│   │IoT/OT │   │Outlook│   │Share- │
│ID/SSO │  │Fusion │  │Now    │   │Devices│   │/Google│   │Point  │
│SCIM   │  │ERP    │  │/Jira  │   │MQTT   │   │Cal    │   │       │
└───────┘  └───────┘  └───────┘   └───────┘   └───────┘   └───────┘
```

---

## 4. Frontend Architecture

### 4.1 Tech Stack (Same as Existing)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19 + TypeScript 6 | Component library |
| Build | Vite 8 | Dev server, bundling |
| Routing | react-router-dom 7 | SPA routing |
| UI Components | ShadCN UI (Radix primitives) + Tailwind CSS 4 | Design system |
| State (Client) | Zustand 5 | Auth, UI state |
| State (Server) | TanStack Query 5 | Data fetching, caching |
| Forms | react-hook-form 7 + Zod 4 (@hookform/resolvers) | Form validation |
| Charts | Recharts 3 | Dashboards, analytics |
| Icons | Lucide React | Icon set |
| Date Utils | date-fns 4 | Date formatting |
| HTTP | Fetch / Axios | API calls (via generated client) |

### 4.2 Architecture Patterns (Reusable from Existing)

| Pattern | Existing File | Reuse Strategy |
|---------|--------------|----------------|
| **Design System** | `src/components/ui/*` | Full reuse — Button, Input, Dialog, Table, Badge, Card, etc. |
| **Layout System** | `src/components/layout/*` | Full reuse — AppLayout, Sidebar, Header |
| **Form Components** | `src/components/forms/*` | Full reuse — FormInput, FormSelect, FormDatePicker, etc. |
| **Shared Components** | `src/components/shared/*` | Full reuse — LoadingState, ErrorState, EmptyState, ConfirmDialog, etc. |
| **Store Pattern** | `src/store/*` | Reuse pattern — Zustand with persist middleware |
| **Type Definitions** | `src/types/index.ts` | **Replace entirely** with Research LMS types |
| **Routing Structure** | `src/App.tsx` | Reuse pattern — ProtectedRoute, AppLayout wrapper |
| **API/Mock Layer** | `src/lib/api.ts` + `src/mock/*` | Rewrite — Replace with real API client (generated OpenAPI) |
| **Vite Config** | `vite.config.ts` | Full reuse — path aliases, React plugin, Tailwind plugin |
| **CSS Theme** | `src/index.css` | Full reuse — Tailwind + CSS custom properties + dark mode |

### 4.3 Frontend Module Structure (Mapped to SOW)

```
src/
├── modules/
│   ├── auth/              # Login, MFA, SSO callback, forgot/reset password
│   ├── dashboard/         # Role-based dashboards (admin, facility, PI, researcher)
│   ├── facility/          # Facility & Equipment Management (Pillar 1)
│   │   ├── assets/        # Asset register, lifecycle, depreciation
│   │   ├── instruments/   # Instrument list, config, IoT dashboard
│   │   ├── maintenance/   # Predictive maintenance UI, work orders
│   │   └── rooms/         # Room management, utilization
│   ├── users/             # User Management + SSO/SCIM (Pillar 2)
│   ├── roles/             # RBAC/ABAC, permission matrix (Pillar 2)
│   ├── institutions/      # Multi-institution federation (Pillar 2)
│   ├── scheduler/         # Online scheduler (Pillar 3)
│   │   ├── calendar/      # Calendar grid, recurring bookings
│   │   ├── constraints/   # Training/consumable/maintenance constraints
│   │   ├── waitlist/      # Waitlist management
│   │   └── requests/      # Sample/service request forms
│   ├── workflow/          # Workflow engine UI (Pillar 3)
│   ├── projects/          # Project management (Pillar 3)
│   ├── inventory/         # Supplies & Inventory (Pillar 3)
│   ├── issues/            # Issue tracking (Pillar 3)
│   ├── billing/           # Invoicing, ERP integration (Pillar 4)
│   ├── pricing/           # Pricing models (Pillar 4)
│   ├── compliance/        # Audit trails, e-signatures (Pillar 4)
│   ├── analytics/         # Dashboards, widgets, reports (Pillar 5)
│   ├── training/          # Training module (Pillar 6)
│   ├── announcements/     # Announcements (Pillar 6)
│   ├── notifications/     # Notification center (Pillar 6)
│   ├── help/              # Help & support guide (Pillar 6)
│   ├── publications/      # Publication tracking (Pillar 6)
│   ├── ai-modules/        # AI Modules M1-M7 (Pillar 7)
│   │   ├── m1-helpdesk/
│   │   ├── m2-talk-to-action/
│   │   ├── m3-equipment-faq/
│   │   ├── m4-iot-automation/
│   │   ├── m5-predictive-maintenance/
│   │   ├── m6-planning-optimization/
│   │   └── m7-self-evolution/
│   ├── portals/           # Mobile app screens (UI only)
│   ├── settings/          # System settings
│   └── subscription/      # SaaS management, tenant admin
├── shared/                # Reusable components (from existing lims-frontend)
│   ├── ui/                # ShadCN UI components (full reuse)
│   ├── forms/             # Form components (full reuse)
│   └── layouts/           # AppLayout, Sidebar, Header (full reuse)
├── lib/                   # Utilities, API client, helpers
├── store/                 # Zustand stores
├── hooks/                 # Custom hooks
└── types/                 # TypeScript interfaces (new Research LMS types)
```

### 4.4 Key Frontend Improvements Over Existing

| Area | Existing Issue | Research LMS Target |
|------|---------------|-------------------|
| Form Validation | Zod unused, manual validation | react-hook-form + Zod on every form |
| Route Guards | Not implemented | ProtectedRoute with role+permission checks on every route |
| API Layer | Mock-only, tightly coupled | Generated OpenAPI client with interceptors, error handling |
| Code Splitting | Static imports, 2.27MB bundle | Route-level lazy loading with Suspense |
| Accessibility | No audit | WCAG 2.2 AA compliance throughout |
| Testing | Zero tests | Vitest unit tests + Playwright E2E |
| i18n | English only | i18next foundation |

---

## 5. Backend Architecture

### 5.1 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime** | Node.js 22 LTS (NestJS) | Enterprise-grade, TypeScript-native, same language as frontend, strong module system |
| **Alternative** | .NET 9 (C#) | If team prefers .NET ecosystem; higher throughput for IoT/real-time |
| **API Protocol** | REST (primary) + GraphQL (secondary) | REST for CRUD; GraphQL for analytics dashboards |
| **API Documentation** | OpenAPI 3.1 + Stoplight | Auto-generated from NestJS decorators |
| **Database** | PostgreSQL 17 | Primary relational DB |
| **Time-Series** | TimescaleDB (PostgreSQL extension) | IoT sensor data, instrument telemetry, usage metrics |
| **Cache** | Redis 7 | Session store, rate limiting, job queues, real-time pub/sub |
| **Search** | Elasticsearch 8 | Full-text search across equipment, assets, logs |
| **Message Queue** | Apache Kafka | Event bus for async workflows, IoT ingestion, integrations |
| **File Storage** | MinIO (S3-compatible) | SOP documents, instrument manuals, attachments |
| **Graph DB (optional)** | Neo5j | Asset relationship mapping, chain of custody |
| **Monitoring** | Prometheus + Grafana + ELK | Metrics, logs, tracing |
| **Containerization** | Docker + Kubernetes | Orchestration, scaling, multi-tenant isolation |
| **CI/CD** | GitHub Actions + ArgoCD | GitOps deployment |

### 5.2 Microservice Breakdown

| Service | Responsibility | DB | Scale |
|---------|---------------|----|-------|
| **auth-service** | SSO/OIDC, MFA, session management, SCIM | PostgreSQL | 2-4 pods |
| **identity-service** | User CRUD, role management, ABAC policies, institution federation | PostgreSQL | 2-4 pods |
| **facility-service** | Asset register, equipment lifecycle, depreciation, chain of custody, QR/barcode | PostgreSQL | 3-6 pods |
| **scheduler-service** | Online calendar, recurring bookings, constraints, waitlists | PostgreSQL | 3-6 pods |
| **request-service** | Sample/service request forms, milestones, conditional logic, approvals | PostgreSQL | 2-4 pods |
| **workflow-engine** | Reusable workflow engine, custom statuses, notification rules, state machine | PostgreSQL | 2-3 pods |
| **inventory-service** | Supplies catalog, pricing, reorder alerts, barcode scanning | PostgreSQL | 2-3 pods |
| **project-service** | Project dashboard, work orders, cost centers | PostgreSQL | 2-3 pods |
| **issue-service** | Issue tracking, ServiceNow/Jira integration | PostgreSQL | 2-3 pods |
| **billing-service** | Invoicing, ERP integration, pricing models, tax/VAT | PostgreSQL | 2-4 pods |
| **compliance-service** | Immutable audit logs, e-signatures, reason-for-change tracking | PostgreSQL + S3 | 2-3 pods |
| **analytics-service** | Aggregations, report generation, scheduled exports | PostgreSQL + TimescaleDB | 3-6 pods |
| **notification-service** | Email/SMS/Teams push, templates, delivery tracking | PostgreSQL | 2-4 pods |
| **training-service** | Competency tracking, prerequisite gating, expiry management | PostgreSQL | 2-3 pods |
| **announcement-service** | Facility homepage builder, announcements, publication tracking | PostgreSQL | 1-2 pods |
| **help-service** | Documentation, walkthroughs, release notes | PostgreSQL + S3 | 1-2 pods |
| **iot-ingestion-service** | OPC-UA/MQTT/Modbus ingestion, threshold detection, anomaly alerts | TimescaleDB + Kafka | 4-8 pods |
| **ai-service** | M1-M7 AI modules, LLM orchestration, MCP server/client | PostgreSQL + Vector DB | 4-8 pods |
| **integration-gateway** | Webhook delivery, Entra ID sync, Calendar sync, ERP connector | PostgreSQL | 2-4 pods |

### 5.3 Inter-Service Communication

```
┌────────────┐     REST/gRPC      ┌────────────┐
│  Service A │ ◄────────────────► │  Service B │
└──────┬─────┘                    └────────────┘
       │
       │  Events (Kafka)
       ▼
┌──────────────────────────────────────────────┐
│              Event Bus (Kafka)                │
│  Topics:                                     │
│  ├── equipment.status.changed                │
│  ├── booking.created / .updated / .cancelled │
│  ├── sample.request.submitted                │
│  ├── invoice.generated                       │
│  ├── iot.alert.triggered                     │
│  ├── audit.log.created                       │
│  ├── notification.required                   │
│  └── mcp.action.executed                     │
└──────────────────────────────────────────────┘
```

### 5.4 API Gateway Configuration

- **Kong API Gateway** with plugins:
  - OIDC authentication (Entra ID)
  - Rate limiting (per tenant, per endpoint)
  - Request/response transformation
  - CORS management
  - MCP Gateway — routes MCP tool calls to appropriate microservices
  - Audit logging — captures all API requests for compliance

---

## 6. Module Map (SOW → System)

| SOW Pillar | SOW Section | System Modules | Frontend Pages | Backend Service |
|------------|-------------|----------------|----------------|-----------------|
| **Pillar 1** | Facility & Equipment | Asset Management | `facility/assets/*` | facility-service |
| | | Instrument Management | `facility/instruments/*` | facility-service |
| | | IoT Monitoring | `facility/iot/*` | iot-ingestion-service |
| | | Predictive Maintenance | `facility/maintenance/*` | ai-service (M5) |
| | | Depreciation Tracking | `facility/assets/depreciation` | facility-service |
| | | Chain of Custody | `facility/assets/custody` | facility-service (+compliance) |
| | | QR/Barcode | `facility/assets/qr` | facility-service |
| | | Global Search | `search/*` | elasticsearch |
| **Pillar 2** | User, Role & Institution | User Management | `users/*` | identity-service |
| | | SSO/SCIM | `settings/sso` | auth-service |
| | | RBAC/ABAC | `roles/*` | identity-service |
| | | Multi-Institution | `institutions/*` | identity-service |
| | | Trainer Sync | `trainers/*` | scheduler-service |
| **Pillar 3** | Operations & Scheduling | Online Scheduler | `scheduler/calendar/*` | scheduler-service |
| | | Sample/Service Requests | `scheduler/requests/*` | request-service |
| | | Workflow Engine | `workflow/*` | workflow-engine |
| | | Project Management | `projects/*` | project-service |
| | | Inventory | `inventory/*` | inventory-service |
| | | Issue Tracking | `issues/*` | issue-service |
| **Pillar 4** | Financial & Compliance | Invoicing | `billing/invoices/*` | billing-service |
| | | ERP Integration | `billing/erp` | integration-gateway |
| | | Pricing Models | `billing/pricing/*` | billing-service |
| | | Audit Trails | `compliance/audit/*` | compliance-service |
| | | E-Signatures | `compliance/esign/*` | compliance-service |
| **Pillar 5** | Analytics & BI | Configurable Dashboards | `analytics/dashboards/*` | analytics-service |
| | | Ad-Hoc Reporting | `analytics/reports/*` | analytics-service |
| | | Instrument 365 View | `analytics/instrument-365` | analytics-service |
| | | Scheduled Emails | `analytics/schedules` | analytics-service |
| **Pillar 6** | Communication & Training | Training Module | `training/*` | training-service |
| | | Announcements | `announcements/*` | announcement-service |
| | | Notification Center | `notifications/*` | notification-service |
| | | Help & Support | `help/*` | help-service |
| | | Facility Homepage | `homepage/*` | announcement-service |
| | | Publications | `publications/*` | announcement-service |
| **Pillar 7** | AI Modules (M1-M7) | M1: Helpdesk | `ai/m1-helpdesk` | ai-service |
| | | M2: Talk-to-Action | `ai/m2-talk-to-action` | ai-service |
| | | M3: Equipment FAQ/KB | `ai/m3-equipment-faq` | ai-service |
| | | M4: IoT Automation | `ai/m4-iot-automation` | ai-service (+iot) |
| | | M5: Predictive Maintenance | `ai/m5-predictive-maintenance` | ai-service (+facility) |
| | | M6: Planning & Optimization | `ai/m6-planning` | ai-service |
| | | M7: Self-Evolution | `ai/m7-self-evolution` | ai-service |
| **Pillar 8** | UI | Web App | All modules above | — |
| | | iOS App | `portals/patient-mobile` | — |
| | | Android App | `portals/doctor-mobile` | — |

---

## 7. Data Architecture

### 7.1 Core Domain Models

```typescript
// ──────────────────────────────────────────────
// Pillar 1: Facility & Equipment
// ──────────────────────────────────────────────

interface Institution {
  id: string
  name: string
  domain: string
  logo?: string
  addresses: Address[]
  subscriptionPlan: PlanTier
  settings: InstitutionSettings
  createdAt: string
}

interface Facility {
  id: string
  institutionId: string
  name: string
  type: "core_facility" | "research_lab" | "teaching_lab" | "biosafety_lab"
  location: string
  contacts: Contact[]
  operatingHours: OperatingHours[]
  isActive: boolean
}

interface Asset {
  id: string
  facilityId: string
  category: AssetCategory  // "instrument" | "equipment" | "room" | "vehicle"
  name: string
  identifier: string       // Serial number / asset tag
  model: string
  manufacturer: string
  acquisitionDate: string
  acquisitionCost: number
  currentValue: number     // After depreciation
  salvageValue: number
  usefulLifeYears: number
  depreciationMethod: "straight_line" | "declining_balance"
  location: string
  status: AssetStatus
  customFields: Record<string, any>
  qrCode: string
  rfidTag?: string
  chainOfCustody: CustodyEvent[]
  attachments: Attachment[]
  createdAt: string
}

interface CustodyEvent {
  id: string
  assetId: string
  fromUserId?: string
  toUserId: string
  fromLocation?: string
  toLocation: string
  timestamp: string
  reason: string
  signedBy: string         // Digital signature reference
}

interface Instrument extends Asset {
  // Extends Asset
  ipAddress?: string
  port?: number
  connectionProtocol: "opc-ua" | "mqtt" | "modbus" | "rest" | "none"
  firmware: string
  lastCalibration: string
  nextCalibration: string
  maintenanceInterval: number  // Days
  iotEnabled: boolean
  telemetry: TelemetryConfig
}

// ──────────────────────────────────────────────
// Pillar 2: Users & Roles
// ──────────────────────────────────────────────

type UserRole = "institution_admin" | "facility_admin" | "lab_admin" | "principal_investigator" | "trainer" | "researcher" | "student" | "technician" | "billing_admin"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  institutions: UserInstitution[]
  entitlements: string[]  // From Entra ID / SCIM
  trainerProfile?: TrainerProfile
  settings: UserSettings
  isActive: boolean
  mfaEnabled: boolean
  lastLogin: string
  createdAt: string
}

interface Role {
  id: string
  name: string
  description: string
  type: "rbac" | "abac"
  permissions: Permission[]
  abacRules?: ABACRule[]
  institutionId: string
  isSystem: boolean
}

interface ABACRule {
  attribute: string       // e.g., "department", "clearance_level", "grant_id"
  operator: "eq" | "neq" | "in" | "gt" | "lt" | "contains"
  value: string | string[] | number
}

// ──────────────────────────────────────────────
// Pillar 3: Scheduling & Operations
// ──────────────────────────────────────────────

interface Booking {
  id: string
  assetId: string
  userId: string
  projectId?: string
  grantId?: string
  startTime: string
  endTime: string
  status: BookingStatus
  purpose: string
  prerequisites: PrerequisiteCheck[]
  recurringRule?: RecurringRule
  waitlistPosition?: number
  cost: number
  actualStartTime?: string
  actualEndTime?: string
  usageMetrics?: UsageMetrics
  createdAt: string
}

interface ServiceRequest {
  id: string
  requesterId: string
  facilityId: string
  type: "sample_processing" | "data_collection" | "consultation" | "training"
  formData: Record<string, any>  // Dynamic form builder output
  milestones: Milestone[]
  status: RequestStatus
  approvals: Approval[]
  createdAt: string
}

interface WorkflowDefinition {
  id: string
  name: string
  description: string
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  notificationRules: NotificationRule[]
}

// ──────────────────────────────────────────────
// Pillar 4: Financial & Compliance
// ──────────────────────────────────────────────

interface Invoice {
  id: string
  invoiceNumber: string
  institutionId: string
  userId?: string
  projectId?: string
  grantId?: string
  lineItems: InvoiceLineItem[]
  pricingModel: PricingModelType
  subtotal: number
  tax: TaxBreakdown[]
  total: number
  status: InvoiceStatus
  erpPostingId?: string       // Reference to Oracle Fusion
  dueDate: string
  paidAt?: string
  pdfUrl: string
  createdAt: string
}

interface AuditEvent {
  id: string
  timestamp: string
  actorId: string
  action: string
  resourceType: string
  resourceId: string
  changes: ChangeRecord[]
  ipAddress: string
  sessionId: string
  immutable: true            // Once written, cannot be deleted
  mcpInvocationId?: string   // If triggered via MCP
  signature?: string         // Hash chain for immutability
}

// ──────────────────────────────────────────────
// Pillar 5: Analytics
// ──────────────────────────────────────────────

interface DashboardDefinition {
  id: string
  name: string
  userId: string
  layout: DashboardWidget[]
  isDefault: boolean
  schedule?: ReportSchedule  // For emailed reports
  createdAt: string
}

interface DashboardWidget {
  id: string
  type: "kpi" | "chart" | "table" | "metric" | "instrument_365"
  title: string
  dataSource: string         // Analytics service query ref
  position: { x: number; y: number; w: number; h: number }
  filters: WidgetFilter[]
  refreshInterval: number    // Seconds
}
```

### 7.2 Database Strategy

| Data Type | Storage | Sharding Strategy |
|-----------|---------|------------------|
| User/Identity | PostgreSQL | By institution ID |
| Assets/Equipment | PostgreSQL | By institution ID |
| Bookings/Schedules | PostgreSQL | By institution + time range |
| IoT Telemetry | TimescaleDB | By instrument ID + time (hypertable) |
| Audit Logs | PostgreSQL (partitioned by month) | By institution + date |
| File Attachments | MinIO/S3 | Bucket per institution |
| Search Index | Elasticsearch | Index per institution |
| Session/Cache | Redis | Key-value, TTL-based |
| Analytics Cache | Redis | Materialized query cache |
| MCP Context | PostgreSQL + Vector DB | By session/agent |

---

## 8. Integration Architecture

### 8.1 Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION GATEWAY                          │
│                    (Kong + Custom Connectors)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Entra   │  │  Oracle  │  │ Service  │  │   Outlook /   │  │
│  │  ID/SSO  │  │  Fusion  │  │ Now/Jira │  │   Google Cal  │  │
│  │  OIDC    │  │  ERP     │  │  REST    │  │   CalDAV      │  │
│  │  SCIM    │  │  SOAP    │  │  Webhook │  │   OAuth 2.0   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │             │                │          │
│  ┌────┴─────┐  ┌─────┴────┐  ┌────┴─────┐  ┌──────┴───────┐  │
│  │ SCIM     │  │ ERP      │  │ Ticket   │  │ Calendar     │  │
│  │ Connector│  │Connector │  │ Connector│  │ Connector    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │SharePoint│  │  IoT/OT  │  │  Banner  │  │  Salesforce   │  │
│  │/OneDrive │  │ OPC-UA   │  │  SIS     │  │  CRM          │  │
│  │ GraphAPI │  │ MQTT     │  │  REST    │  │  REST         │  │
│  │          │  │ Modbus   │  │          │  │               │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │             │                │          │
│  ┌────┴─────┐  ┌─────┴────┐  ┌────┴─────┐  ┌──────┴───────┐  │
│  │ Document │  │ IoT      │  │ SIS      │  │ CRM          │  │
│  │ Connector│  │Gateway   │  │ Connector│  │ Connector    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Webhook Architecture

```yaml
Webhook Delivery:
  - Event: Any domain event from Kafka
  - Delivery: HTTP POST to registered webhook URLs
  - Retry: Exponential backoff (3 attempts)
  - Security: HMAC signature verification
  - Registry: WebhookSubscription CRUD in integration-gateway

Standard Webhook Events:
  booking.created
  booking.cancelled
  instrument.status.changed
  instrument.maintenance.due
  invoice.generated
  invoice.paid
  sample.request.submitted
  iot.alert.triggered
  training.competency.expired
  audit.event.created
```

### 8.3 Calendar Sync (Outlook/Google)

- Bi-directional sync via CalDAV + Microsoft Graph API
- Booking creation → Calendar event creation
- Calendar event update → Booking reschedule
- Conflict detection before booking confirmation
- Trainer availability synced from Outlook/Google calendar

---

## 9. Security Architecture

### 9.1 Authentication & Authorization

```
┌──────────┐     OIDC      ┌────────────┐
│  Browser │ ◄───────────► │   Entra    │
│  / App   │               │  ID/SSO    │
└────┬─────┘               └────────────┘
     │  JWT (access + refresh)
     ▼
┌─────────────────────────────────────┐
│         API Gateway (Kong)          │
│  ├─ Validate JWT (OIDC plugin)     │
│  ├─ Extract tenant from sub claim  │
│  ├─ Rate limit per tenant          │
│  └─ Forward x-user-id, x-tenant-id │
└──────────┬──────────────────────────┘
           │  gRPC / REST with headers
           ▼
┌─────────────────────────────────────┐
│      Microservice RBAC Check        │
│  ├─ Role check (from user profile) │
│  ├─ ABAC rule evaluation           │
│  └─ Resource-level permission      │
└─────────────────────────────────────┘
```

### 9.2 Security Controls

| Control | Implementation |
|---------|---------------|
| **Authentication** | OIDC via Entra ID; fallback local accounts with bcrypt |
| **MFA** | TOTP (authenticator app) + SMS backup codes |
| **Conditional Access** | IP-based + device compliance + risk-based (Entra ID) |
| **Authorization** | RBAC (role → permissions) + ABAC (attributes → rules) |
| **Data at Rest** | AES-256 encryption (PostgreSQL TDE + MinIO SSE-S3) |
| **Data in Transit** | TLS 1.2+ minimum; mTLS for inter-service |
| **API Security** | JWT validation, rate limiting, request signing |
| **IoT Security** | Device certificates, network segmentation, encrypted protocols |
| **Audit** | Immutable audit logs (hash chain), SIEM integration |
| **Secrets** | HashiCorp Vault for secrets management |
| **Pen Testing** | Quarterly vulnerability assessments; SLA-defined remediation |

### 9.3 MCP Security Architecture

```
┌──────────────┐      MCP over WSS      ┌──────────────────┐
│  AI Agent /  │ ◄────────────────────► │   MCP Gateway    │
│  3rd-Party   │   (Mutual TLS)         │   (Kong Plugin)  │
│  Tool Call   │                        │                  │
└──────────────┘                        └───────┬──────────┘
                                                │
                          ┌─────────────────────┤
                          ▼                     ▼
                  ┌──────────────┐     ┌────────────────┐
                  │  Auth Check  │     │  Permission    │
                  │  (User/Agent)│     │  Check (RBAC)  │
                  └──────┬───────┘     └───────┬────────┘
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                          ┌──────────────────┐
                          │  High-Risk Ops?  │──Yes──► Human Approval Gate
                          │  (Equipment      │        (Await approval event)
                          │   config, safety,│
                          │   billing, etc.) │
                          └────────┬─────────┘
                                   │ No
                                   ▼
                          ┌──────────────────┐
                          │  Execute Tool    │
                          │  (via Kafka evt) │
                          └────────┬─────────┘
                                   ▼
                          ┌──────────────────┐
                          │  Audit Trail     │
                          │  (immutable log) │
                          └──────────────────┘

MCP Tool Categories:
  ├── Read-only (no approval): GET asset info, search, list bookings
  ├── Low-risk (no approval): create booking, submit request
  └── High-risk (human approval): modify equipment config, cancel bookings,
      approve invoices, change access permissions, execute maintenance actions
```

---

## 10. AI/ML Architecture (M1-M7)

### 10.1 High-Level AI Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        AI SERVICE                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  LLM     │  │  Vector   │  │   RAG    │  │   MCP Server  │  │
│  │ Router   │  │  Database  │  │ Pipeline │  │   (Tool Def)  │  │
│  │ (Ollama/ │  │(Pgvector/ │  │          │  │               │  │
│  │  OpenAI) │  │ Pinecone)  │  │          │  │               │  │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │               │             │                │          │
│       └───────┬───────┴───────┬─────┘                │          │
│               │               │                      │          │
│  ┌────────────┴────┐  ┌──────┴──────────┐  ┌────────┴────────┐ │
│  │ M1: Helpdesk    │  │ M2: Talk-to-    │  │ M3: Equipment   │ │
│  │ Chat + Voice    │  │ Action          │  │ FAQ / KB        │ │
│  │ Ticket creation │  │ Intent routing  │  │ SOP indexing    │ │
│  │ SLA dashboard   │  │ Dry-run preview │  │ QR-linked help  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────────┐│
│  │ M4: IoT    │  │ M5: Predictive│  │ M6: Planning & Opt.      ││
│  │ Automation │  │ Maintenance   │  │ Capacity modeling         ││
│  │ Sensor     │  │ RUL modeling  │  │ Batching, energy opt.    ││
│  │ ingestion  │  │ Failure mode  │  │ Fairness enforcement     ││
│  │ Soft→hard  │  │ Auto work     │  │ Feedback loop            ││
│  │ actions    │  │ orders        │  │                          ││
│  └────────────┘  └──────────────┘  └───────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ M7: Self-Evolution                                     │     │
│  │ Gap analysis → Module design → Supervised deploy       │     │
│  │ → Track effectiveness → Iterative refinement           │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 10.2 Module Details

#### M1 — Helpdesk
- Voice + text interaction via WebSocket
- Multi-turn intent handling (NLU)
- RAG-based knowledge retrieval with citations
- Automated ticket creation → ServiceNow/Jira
- SLA + performance dashboards
- Cross-platform: web, mobile, kiosk

#### M2 — Talk-to-Action
- Natural language → system commands
- Dry-run preview before execution
- Safe-action guardrails (cannot execute destructive ops without approval)
- Supports: booking, requesting, status inquiries, data queries

#### M3 — Equipment FAQ & Knowledge Base
- SOPs/manuals indexed into vector DB
- RAG with source citations
- QR-code-linked contextual assistance (scan QR → get relevant FAQ)
- Automatic update when new manuals uploaded

#### M4 — IoT Integration & Automation
- Real-time sensor data ingestion (OPC-UA/MQTT/Modbus)
- Threshold-based alerts → automated actions (e.g., temp out of range → notify + shutdown)
- Soft actions (alerts) → hard actions (automated equipment control with safety gates)
- IoT security: device certs, encrypted channels, network segmentation

#### M5 — Predictive Maintenance
- Remaining Useful Life (RUL) modeling using telemetry history
- Failure mode classification
- Automated work order generation
- Blueprint for fix → recommended solutions → TODO list for technician
- Feedback loop: technician outcome improves future predictions

#### M6 — Planning & Optimization
- Capacity modeling for equipment and staff
- Batching optimization for sample processing
- Energy consumption optimization
- Fairness policy enforcement across PIs/groups
- Feedback collection from technicians (passive sensor data + active feedback)

#### M7 — Self-Evolution
- Automated gap analysis against operational patterns
- Design new modules/configurations based on gaps
- Auto-generate workflow and template improvements
- Supervised deployment with human approval gates
- Post-deployment effectiveness tracking
- Iterative refinement cycle

---

## 11. Deployment Architecture

```
                    ┌─────────────────────────────┐
                    │      AWS / Azure / GCP       │
                    └─────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │        Kubernetes (EKS/AKS)     │
                    │  ┌─────────────────────────┐   │
                    │  │  Production Namespace   │   │
                    │  │  ┌───┐ ┌───┐ ┌───┐     │   │
                    │  │  │Svc│ │Svc│ │Svc│ ... │   │
                    │  │  └───┘ └───┘ └───┘     │   │
                    │  └─────────────────────────┘   │
                    │  ┌─────────────────────────┐   │
                    │  │  Staging Namespace      │   │
                    │  └─────────────────────────┘   │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │        Data Layer              │
                    │  ┌──────┐ ┌──────┐ ┌──────┐  │
                    │  │ RDS  │ │Elasti│ │Memory│  │
                    │  │PG/TD │ │cache │ │DB    │  │
                    │  └──────┘ └──────┘ └──────┘  │
                    └───────────────────────────────┘

Deployment Strategy:
  - GitOps via ArgoCD (GitHub → K8s)
  - Canary deployments for high-risk services
  - Blue-green for frontend deployments
  - HPA (Horizontal Pod Autoscaler) based on CPU/memory/custom metrics

Disaster Recovery:
  - Multi-AZ deployment
  - Cross-region read replicas (RPO < 15 min)
  - Automated backup: DB daily, files continuous
  - DR testing quarterly
  - RTO: 1 hour, RPO: 15 minutes
```

---

## 12. Folder Structure

```
research-lms/
├── frontend/                          # React SPA (from existing lims-frontend patterns)
│   ├── public/
│   ├── src/
│   │   ├── modules/                   # Feature modules (see Section 4.3)
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── facility/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── institutions/
│   │   │   ├── scheduler/
│   │   │   ├── workflow/
│   │   │   ├── projects/
│   │   │   ├── inventory/
│   │   │   ├── issues/
│   │   │   ├── billing/
│   │   │   ├── pricing/
│   │   │   ├── compliance/
│   │   │   ├── analytics/
│   │   │   ├── training/
│   │   │   ├── announcements/
│   │   │   ├── notifications/
│   │   │   ├── help/
│   │   │   ├── publications/
│   │   │   ├── ai-modules/
│   │   │   ├── portals/
│   │   │   ├── settings/
│   │   │   └── subscription/
│   │   ├── shared/                    # Reused from existing: ui/, forms/, layouts/
│   │   ├── lib/                       # API client, utils, helpers
│   │   ├── store/                     # Zustand stores
│   │   ├── hooks/                     # Custom hooks
│   │   ├── types/                     # TypeScript interfaces
│   │   └── mock/                      # Mock data (dev only)
│   ├── index.html
│   ├── vite.config.ts                 # Same as existing
│   ├── tsconfig.json
│   └── package.json                   # Same deps + i18next, axios, etc.
│
├── backend/                           # NestJS monorepo
│   ├── apps/
│   │   ├── api-gateway/              # Kong config
│   │   ├── auth-service/
│   │   ├── identity-service/
│   │   ├── facility-service/
│   │   ├── scheduler-service/
│   │   ├── request-service/
│   │   ├── workflow-engine/
│   │   ├── inventory-service/
│   │   ├── project-service/
│   │   ├── issue-service/
│   │   ├── billing-service/
│   │   ├── compliance-service/
│   │   ├── analytics-service/
│   │   ├── notification-service/
│   │   ├── training-service/
│   │   ├── announcement-service/
│   │   ├── help-service/
│   │   ├── iot-ingestion-service/
│   │   ├── ai-service/
│   │   └── integration-gateway/
│   ├── libs/
│   │   ├── shared/                    # Shared DTOs, interfaces, utilities
│   │   ├── database/                  # Database configs, migrations
│   │   └── mcp/                       # MCP protocol implementation
│   ├── docker/
│   ├── k8s/                           # Kubernetes manifests
│   └── package.json
│
├── mobile/
│   ├── ios/                           # SwiftUI app
│   └── android/                       # Jetpack Compose app
│
├── infrastructure/
│   ├── terraform/                     # IaC: AWS/Azure resources
│   ├── helm/                          # Helm charts for K8s
│   └── monitoring/                    # Prometheus + Grafana configs
│
├── docs/
│   ├── architecture.md                # This document
│   ├── api/                           # OpenAPI specs
│   └── srs/                           # Software requirements
│
└── scripts/
    ├── seed/                          # Database seeding
    └── migrations/                    # Schema migrations
```

---

## 13. API Design

### 13.1 API Standards

```yaml
Base URL: https://api.{tenant}.research-lms.com/v1

Headers:
  Authorization: Bearer <JWT>
  X-Tenant-Id: <tenant-id>
  X-Request-Id: <correlation-id>
  Accept-Language: en | ar (UAE PDPL compliance)

Response Envelope:
  {
    "data": T,
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    },
    "error": null
  }

Error Envelope:
  {
    "data": null,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input",
      "details": [
        { "field": "email", "message": "Must be a valid email" }
      ],
      "traceId": "req-abc-123"
    }
  }
```

### 13.2 Key API Endpoints

| Method | Endpoint | Service | Description |
|--------|----------|---------|-------------|
| `POST` | `/auth/login` | auth-service | SSO login or local auth |
| `POST` | `/auth/mfa/verify` | auth-service | TOTP verification |
| `GET` | `/users` | identity-service | List users (paginated, filtered) |
| `POST` | `/users` | identity-service | Create user |
| `GET` | `/users/{id}` | identity-service | Get user details |
| `PUT` | `/users/{id}` | identity-service | Update user |
| `DELETE` | `/users/{id}` | identity-service | Deactivate user |
| `GET` | `/institutions` | identity-service | List institutions |
| `GET` | `/assets` | facility-service | List assets (paginated, filtered) |
| `POST` | `/assets` | facility-service | Create asset |
| `GET` | `/assets/{id}` | facility-service | Get asset with custodian chain |
| `PUT` | `/assets/{id}` | facility-service | Update asset |
| `POST` | `/assets/{id}/transfer` | facility-service | Transfer custody |
| `GET` | `/assets/{id}/telemetry` | iot-ingestion-service | Get time-series telemetry |
| `GET` | `/instruments` | facility-service | List instruments |
| `POST` | `/instruments` | facility-service | Register instrument |
| `GET` | `/bookings` | scheduler-service | List bookings |
| `POST` | `/bookings` | scheduler-service | Create booking (with constraint check) |
| `POST` | `/bookings/{id}/cancel` | scheduler-service | Cancel booking |
| `GET` | `/bookings/availability` | scheduler-service | Check slot availability |
| `GET` | `/workflows` | workflow-engine | List workflow definitions |
| `POST` | `/workflows` | workflow-engine | Create workflow definition |
| `POST` | `/workflows/{id}/execute` | workflow-engine | Start workflow instance |
| `GET` | `/requests` | request-service | List service requests |
| `POST` | `/requests` | request-service | Submit service request |
| `GET` | `/invoices` | billing-service | List invoices |
| `POST` | `/invoices` | billing-service | Generate invoice |
| `POST` | `/invoices/{id}/sync-erp` | billing-service | Sync to Oracle Fusion |
| `GET` | `/audit-logs` | compliance-service | Query audit logs |
| `POST` | `/audit-logs/export` | compliance-service | Export for compliance |
| `GET` | `/dashboard/{type}` | analytics-service | Get dashboard data |
| `POST` | `/dashboard/widgets` | analytics-service | Save widget config |
| `GET` | `/ai/m1/chat` | ai-service | M1 Helpdesk chat (WebSocket) |
| `POST` | `/ai/m2/action` | ai-service | M2 Talk-to-Action (dry-run available) |
| `GET` | `/ai/m3/faq?q={query}` | ai-service | M3 FAQ search (RAG) |
| `POST` | `/ai/m5/predict` | ai-service | M5 Predictive maintenance prediction |
| `POST` | `/mcp/tools/{name}` | api-gateway | MCP tool invocation |

### 13.3 Real-Time Communication

| Channel | Protocol | Use Case |
|---------|----------|----------|
| Booking Calendar Updates | WebSocket | Real-time calendar refresh |
| IoT Alerts | Server-Sent Events (SSE) | Push alerts for threshold breaches |
| M1 Helpdesk Chat | WebSocket | Conversational AI interface |
| Notifications | WebSocket + Web Push | In-app and browser notifications |
| Instrument 365 View | WebSocket | Live telemetry dashboard |
| Approval Gates | WebSocket | Real-time approval waiting |

---

## 14. Technology Stack Summary

### Frontend (Reused from Existing)

| Category | Technology | Source |
|----------|-----------|--------|
| Framework | React 19 + TypeScript 6 | Existing |
| Build | Vite 8 | Existing |
| Routing | react-router-dom 7 | Existing |
| UI | ShadCN + Radix + Tailwind CSS 4 | Existing |
| Forms | react-hook-form 7 + Zod 4 | Existing (was unused) |
| State | Zustand 5 + TanStack Query 5 | Existing |
| Charts | Recharts 3 | Existing |
| Icons | Lucide React | Existing |
| Date | date-fns 4 | Existing |
| HTTP | Axios (new) | New addition |
| i18n | i18next (new) | New addition |
| Testing | Vitest + Playwright (new) | New addition |

### Backend (New)

| Category | Technology | Justification |
|----------|-----------|---------------|
| Runtime | Node.js 22 LTS / NestJS | TypeScript-native, same language as frontend, strong module system |
| API | REST (OpenAPI 3.1) + GraphQL (Apollo) | REST for CRUD, GraphQL for analytics |
| Auth | OIDC (Entra ID) + JWT + bcrypt | Enterprise SSO with fallback |
| ORM | Prisma (TypeScript) | Type-safe DB access, migrations |
| Main DB | PostgreSQL 17 | Mature, ACID, multi-tenant ready |
| Time-Series | TimescaleDB | IoT telemetry at scale |
| Cache | Redis 7 | Session store, rate limiting, pub/sub |
| Search | Elasticsearch 8 | Full-text search |
| Queue | Apache Kafka | Event-driven architecture |
| Storage | MinIO (S3-compatible) | File attachments, SOPs, reports |
| Monitoring | Prometheus + Grafana + ELK | Metrics, logs, traces |
| Container | Docker + Kubernetes | Orchestration, scaling |
| CI/CD | GitHub Actions + ArgoCD | GitOps |
| MCP | Custom NestJS module | MCP server/client protocol |
| LLM | Ollama (local) + OpenAI API fallback | AI modules |
| Vector DB | pgvector (PostgreSQL extension) | RAG embeddings |
| IoT | OPC-UA client + MQTT broker (EMQX) | Instrument connectivity |

### Mobile (New)

| Platform | Tech Stack |
|----------|-----------|
| iOS | SwiftUI + Combine + URLSession |
| Android | Jetpack Compose + Kotlin Coroutines + Retrofit |

---

## 15. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Set up monorepo, Docker, K8s, CI/CD
- Implement auth-service (Entra ID OIDC + local fallback)
- Implement identity-service (users, roles, RBAC/ABAC, multi-institution)
- Build frontend scaffold (reuse existing UI components, routing, layout)
- Implement API Gateway + MCP gateway plugin
- Database provisioning + migrations

### Phase 2: Core Operations (Months 3-6)
- Facility & Equipment Management (facility-service)
- Online Scheduler (scheduler-service)
- Sample/Service Request module (request-service)
- Workflow Engine (workflow-engine)
- Inventory Management (inventory-service)
- Issue Tracking (issue-service)
- Frontend pages for all above

### Phase 3: Financial & Compliance (Months 5-7)
- Billing & Invoicing (billing-service)
- Oracle Fusion ERP integration
- Pricing models
- Compliance service (immutable audit logs, e-signatures)
- Frontend pages for billing, pricing, compliance

### Phase 4: Analytics & Dashboards (Months 6-8)
- Analytics service with configurable dashboards
- Drag-and-drop widget framework (frontend)
- Ad-hoc reporting engine
- Instrument 365 View
- Scheduled email reports
- Executive dashboards

### Phase 5: Communication & Training (Months 7-9)
- Training module (competency, prerequisites, gating)
- Announcements + Facility Homepage Builder
- Notification center (email, SMS, Teams)
- Help & Support guide
- Publication tracking

### Phase 6: AI Modules M1-M3 (Months 8-11)
- M1: AI Helpdesk (chat, voice, ticket creation)
- M2: Talk-to-Action (conversational orchestration)
- M3: Equipment FAQ / Knowledge Base (RAG)
- Frontend AI chat interfaces
- MCP server/client for AI tool invocation

### Phase 7: IoT & Advanced AI (Months 10-14)
- IoT ingestion pipeline (OPC-UA/MQTT/Modbus)
- M4: IoT Automation & Alerts
- M5: Predictive Maintenance (RUL, failure mode, work orders)
- M6: Planning & Optimization (capacity, batching, energy)
- M7: Self-Evolution (gap analysis, module generation)
- Instrument telemetry dashboards

### Phase 8: Mobile & Polish (Months 13-16)
- iOS native app (researcher + technician roles)
- Android native app
- WCAG 2.2 AA compliance pass
- Performance optimization (code splitting, caching)
- Load testing + security pen testing
- DR testing + documentation

### Phase 9: Go-Live & Hypercare (Months 15-18)
- Data migration from legacy systems
- User acceptance testing
- Training & onboarding
- Production cutover
- 30-day hypercare support

---

## Appendix A: Reuse Strategy from Existing `lims-frontend`

| Artifact | Reuse Strategy | Estimated Effort |
|----------|---------------|-----------------:|
| `src/components/ui/*` (27 ShadCN components) | **Full reuse** — copy as-is | 1 day |
| `src/components/forms/*` (11 form components) | **Full reuse** — copy as-is | 0.5 day |
| `src/components/layout/*` (AppLayout, Sidebar, Header) | **Full reuse** — copy + update nav items | 1 day |
| `src/components/shared/*` (LoadingState, ErrorState, EmptyState, etc.) | **Full reuse** — copy as-is | 0.5 day |
| `src/store/appStore.ts` | **Reuse pattern** — update for new app state | 1 day |
| `src/store/authStore.ts` | **Rewrite** — integrate OIDC + SSO | 2 days |
| `src/lib/utils.ts` | **Reuse** — cn(), formatDate(), formatCurrency() | 0.5 day |
| `src/types/index.ts` | **Replace entirely** with Research LMS types | 3 days |
| `src/lib/api.ts` | **Rewrite** — real HTTP client (Axios) instead of mock | 1 day |
| `src/mock/*` | **Keep for dev** — update data to Research LMS domain | 3 days |
| `src/pages/*` (135 pages) | **Discard** — replace with new Research LMS modules | — |
| `src/App.tsx` (routing) | **Reuse pattern** — ProtectedRoute + AppLayout wrapper | 1 day |
| `vite.config.ts` | **Full reuse** | 0 day |
| `package.json` | **Reuse deps** + add i18next, axios | 0.5 day |
| `tailwind.config.ts` | **Full reuse** | 0 day |
| Dark mode CSS vars | **Full reuse** | 0 day |

**Total reuse effort saved:** ~7-10 days of setup

---

## Appendix B: SOW Compliance Matrix

| SOW Requirement | Covered | Module/Service | Priority |
|----------------|:-------:|----------------|:--------:|
| Microservices architecture | ✅ | All services | P0 |
| REST/GraphQL APIs | ✅ | API Gateway | P0 |
| Webhooks/events | ✅ | Event Bus (Kafka) | P0 |
| MCP support | ✅ | MCP Gateway + AI Service | P0 |
| Multi-tenant SaaS | ✅ | All services (tenant-aware) | P0 |
| RBAC + ABAC | ✅ | Identity Service | P0 |
| SSO (Entra ID) | ✅ | Auth Service | P0 |
| SCIM provisioning | ✅ | Auth Service | P1 |
| Multi-institution federation | ✅ | Identity Service | P1 |
| Equipment lifecycle | ✅ | Facility Service | P0 |
| Asset tracking (QR/barcode) | ✅ | Facility Service | P1 |
| RFID/IoT tracking | ✅ | IoT Ingestion Service | P1 |
| Chain of custody | ✅ | Facility + Compliance | P1 |
| Depreciation tracking | ✅ | Facility Service | P2 |
| Online scheduler | ✅ | Scheduler Service | P0 |
| Constraints/waitlists | ✅ | Scheduler Service | P0 |
| Recurring bookings | ✅ | Scheduler Service | P1 |
| Form builder | ✅ | Request Service | P1 |
| Workflow engine | ✅ | Workflow Engine | P0 |
| Project management | ✅ | Project Service | P1 |
| Issue tracking | ✅ | Issue Service | P1 |
| Inventory management | ✅ | Inventory Service | P1 |
| Invoicing (custom templates) | ✅ | Billing Service | P0 |
| ERP integration (Oracle Fusion) | ✅ | Integration Gateway | P1 |
| VAT/tax support | ✅ | Billing Service | P1 |
| Pricing models | ✅ | Billing Service | P1 |
| Immutable audit logs | ✅ | Compliance Service | P0 |
| E-signatures | ✅ | Compliance Service | P1 |
| Configurable dashboards | ✅ | Analytics Service | P0 |
| Drag-and-drop widgets | ✅ | Analytics Service | P1 |
| Ad-hoc reporting | ✅ | Analytics Service | P1 |
| Instrument 365 View | ✅ | Analytics Service | P2 |
| Training module | ✅ | Training Service | P1 |
| Announcements | ✅ | Announcement Service | P2 |
| Notification center | ✅ | Notification Service | P0 |
| Help & support guide | ✅ | Help Service | P2 |
| Facility homepage builder | ✅ | Announcement Service | P2 |
| Publication tracking | ✅ | Announcement Service | P3 |
| M1: Helpdesk AI | ✅ | AI Service | P1 |
| M2: Talk-to-Action | ✅ | AI Service | P1 |
| M3: Equipment FAQ/KB | ✅ | AI Service | P1 |
| M4: IoT Automation | ✅ | AI Service + IoT | P1 |
| M5: Predictive Maintenance | ✅ | AI Service | P1 |
| M6: Planning & Optimization | ✅ | AI Service | P2 |
| M7: Self-Evolution | ✅ | AI Service | P2 |
| WCAG 2.2 AA web | ✅ | Frontend | P1 |
| iOS native app | ✅ | Mobile/iOS | P2 |
| Android native app | ✅ | Mobile/Android | P2 |
| Offline SOP access | ✅ | Mobile (offline-first) | P2 |
| MDM/Intune support | ✅ | Mobile | P3 |
| MFA | ✅ | Auth Service | P0 |
| Conditional access | ✅ | Auth + API Gateway | P1 |
| AES-256 at rest | ✅ | Infrastructure | P0 |
| TLS 1.2+ in transit | ✅ | Infrastructure | P0 |
| ISO 27001 alignment | ✅ | Compliance + Infra | P1 |
| UAE PDPL / GDPR | ✅ | Compliance Service | P1 |
| Disaster recovery (RPO 15m, RTO 1h) | ✅ | Infrastructure | P0 |
| IoT/OT security | ✅ | IoT Ingestion + Infra | P1 |
| Automated backup/failover | ✅ | Infrastructure | P0 |
| Open API documentation | ✅ | API Gateway (OpenAPI) | P0 |
| Data export (no lock-in) | ✅ | All services | P0 |
