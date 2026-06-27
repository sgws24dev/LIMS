# Phase 8 — AI Modules M1-M4: Sprint Plan

**Timeline:** Weeks 23–28 (6 weeks @ 5 days = 30 working days)
**Status:** Greenfield — no existing AI or IoT code
**Dependency on Phase 7:** Content (Help articles, walkthroughs, publications), Communications (notifications, SignalR, templates, announcements), and Training (competencies, prerequisites) modules are complete. Phases 1–6 fully operational. Shared infrastructure (multi-tenancy, MediatR, FluentValidation, Serilog, MassTransit, Hangfire, SignalR, Elasticsearch, Docker Compose, YARP Gateway) already in place.
**New Dependencies:** Ollama (local LLM), Azure AI Search / vector-capable DB, OPC-UA / MQTT / Modbus protocol libraries.

---

## Architecture Decisions

### Service Boundary
Phase 8 introduces one new microservice under `Services/`:

| Microservice | Modules | Rationale |
|-------------|---------|-----------|
| `Services/AiServices/` | M1 Helpdesk, M2 Talk-to-Action, M3 Equipment FAQ, M4 IoT Automation, MCP Server | All AI modules share LLM, RAG, and vector infrastructure; co-located avoids duplication of the AI foundation layer |

### LLM Integration Strategy

```
ILlmService (abstraction)
    ├── OllamaLlmService (default for dev/on-prem)
    │       └── HTTP client → local Ollama instance
    └── OpenAiLlmService (fallback / cloud)
            └── HTTP client → OpenAI API
```
- `ILlmService` interface defines: `ChatAsync(messages, config)`, `GenerateEmbeddingsAsync(texts)`, `StreamChatAsync(messages, config, onDelta)`
- Provider auto-selected by configuration (`Ai:Llm:Provider`: `Ollama` | `OpenAI`)
- Model name configurable per provider: `llama3.1:70b` (Ollama), `gpt-4o` (OpenAI)
- Embeddings model: `nomic-embed-text` (Ollama) or `text-embedding-3-small` (OpenAI)
- Rate limiting + retry via Polly

### RAG Pipeline

```
Document → Chunk (512 tokens, overlap 64) → Embed → Store in Vector DB
                                                         ↓
User Query → Embed query → Vector search (top-k=5) → Context assembly → LLM → Answer
```
- Chunking: recursive character splitter with markdown-aware boundaries
- Vector DB: Azure AI Search (preferred) or SQL Server with manual similarity search fallback
- Metadata stored alongside vectors: source document ID, chunk index, page number, instrument ID (for M3)
- `IRagService` interface: `IndexDocumentAsync(document)`, `SearchAsync(query, filters, topK)`, `RemoveDocumentAsync(documentId)`

### MCP Protocol Implementation

```
MCP Server (ASP.NET Core hosted service)
    ↓
Tool Registry (reflection-based discovery)
    ↓
Tool Execution → Audit Log (McpToolLogs table)
    ↓
Result → structured JSON response
```
- MCP (Model Context Protocol) server exposes tools that AI agents can call
- Tools: `GetInstrumentStatus`, `CreateBooking`, `GetUserCompetencies`, `SearchHelpArticles`, `GetPublicationByDoi`, etc.
- Each tool has a name, description, JSON Schema input, and handler delegate
- Tool audit trail stored in `McpToolLogs` (TenantId, ToolName, Input, Result, ExecutedByUserId, ExecutedAt)

### IoT Ingestion Architecture

```
OPC-UA Server / MQTT Broker / Modbus Gateway
    ↓
IIoTIngestionService (protocol adapters)
    ↓
IoTTelemetry → IoTTelemetry table (time-series, SQL Server with clustered columnstore index recommendation)
    ↓
IAlertEngine (threshold evaluation)
    ├── Threshold breached? → IIoTAlertService (create alert)
    └── Alert matches automation rule? → IAutomationService (execute action)
```
- Protocol adapters: `OpcUaAdapter` (using `OPCFoundation.NetStandard.Opc.Ua`), `MqttAdapter` (using `MQTTnet`), `ModbusAdapter` (using `EasyModbus` or `NModbus`)
- Telemetry schema: `(TenantId, InstrumentId, Timestamp, MetricName, MetricValue, Unit, Tags)`
- Alert engine: configurable thresholds (absolute, rate-of-change, deviation), evaluation window, cooldown period
- Automation rules: if-then engine with safety gates (require human approval for "hard" actions)

### Database Strategy
- `AiServicesDb` — `HelpdeskConversations`, `HelpdeskTickets`, `HelpdeskMessages`, `ActionLogs`, `McpToolLogs`
- Vector index — Azure AI Search index (separate resource) or in-application vector storage
- IoT telemetry — SQL Server table with clustered columnstore index (`IoTTelemetry`), `IoTAlerts`, `AutomationRules`
- File storage (SOPs, manuals) — MinIO / Azure Blob Storage

### SignalR Real-Time for Helpdesk
```
User → HelpdeskHub (SignalR) → ILlmService.StreamChatAsync → Stream response tokens → User
                                                                      ↓
                                              On complete: save conversation → optional ticket creation
```
- Single hub: `/hubs/helpdesk`
- Streaming responses (SSE-style over SignalR)
- Conversation history loaded from DB on connect

---

## Scope Summary

| Area | Backend Tasks | Frontend Tasks | DB Tables | Est. Effort |
|------|:-------------:|:--------------:|-----------|:-----------:|
| Foundation (LLM, Vector DB, RAG, MCP) | 8.1, 8.2, 8.3, 8.4 | — | `McpToolLogs` | 13 days |
| M1: AI Helpdesk | 8.5, 8.6, 8.7 | 8.18, 8.19, 8.20 | `HelpdeskConversations`, `HelpdeskTickets`, `HelpdeskMessages` | 12 days |
| M2: Talk-to-Action | 8.8, 8.9, 8.10 | 8.21, 8.22 | `ActionLogs` | 11 days |
| M3: Equipment FAQ/KB | 8.11, 8.12 | 8.23, 8.24 | Vector index, SOP file storage | 6 days |
| M4: IoT Automation | 8.13, 8.14, 8.15, 8.16 | 8.25, 8.26, 8.27 | `IoTTelemetry`, `IoTAlerts`, `AutomationRules` | 17 days |
| Integration Tests | 8.17 | — | — | 3 days |
| **Total** | **16 backend** | **10 frontend** | **8 tables + vector index + file storage** | **~62 days** |

> Note: Overlap across sprints reduces wall-clock time. Foundation (LLM, RAG, MCP) built in Sprint 1 and reused by M2/M3 in Sprint 2 and M4 in Sprint 3.

---

## Sprint Breakdown

---

### Sprint 1 — AI Foundation + M1: AI Helpdesk (Weeks 23–24, Days 1–10)

**Theme:** LLM integration layer, vector DB setup, RAG pipeline, MCP server, Helpdesk chat with streaming, ticket creation from chat.

#### Backend Tasks — `Services/AiServices/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 8.1 | Set up LLM integration layer | `ILlmService`, `OllamaLlmService`, `OpenAiLlmService` | **ILlmService** interface: `Task<string> ChatAsync(ChatMessage[] messages, LlmConfig config, CancellationToken ct)`, `IAsyncEnumerable<string> StreamChatAsync(...)`, `Task<float[]> GenerateEmbeddingsAsync(string text, CancellationToken ct)`. **LlmConfig**: Model, Temperature (0-2), MaxTokens, TopP. **OllamaLlmService**: HTTP client to `OLLAMA_BASE_URL/api/chat` and `api/embeddings`. **OpenAiLlmService**: HTTP client to OpenAI `/v1/chat/completions` and `/v1/embeddings`. DI registration: `AddSingleton<ILlmService, OllamaLlmService>()` with `HttpClient` configured from `Ai:Llm:Ollama:BaseUrl`. Polly retry (3 retries, exponential backoff). |
| 8.2 | Set up Vector DB | Vector search indexing pipeline | Two implementations (feature-flagged via `Ai:VectorDb:Provider`): **AzureAISearchService** — creates/updates search index, uses `Azure.Search.Documents` SDK, supports hybrid search (semantic + full-text). **InMemoryVectorService** — brute-force cosine similarity search for local dev (no external dependency). Index schema: `(Id, DocumentId, ChunkIndex, Content, Embedding(float[]), Metadata(JSON), InstrumentId, TenantId)`. DI: `IVectorSearchService`. |
| 8.3 | Build RAG pipeline | `IRagService` — chunk, embed, store, retrieve | **IRagService**: `Task IndexDocumentAsync(RagDocument document)`, `Task<RagResult[]> SearchAsync(string query, SearchFilters? filters, int topK = 5)`, `Task RemoveDocumentAsync(string documentId)`. **RagDocument**: Id, Title, Content, SourceType (Sop/HelpArticle/Manual/Generic), SourceUrl, InstrumentId, TenantId. Chunking: recursive splitter with configurable chunk size (512 tokens) and overlap (64 tokens). Embed via `ILlmService.GenerateEmbeddingsAsync`. Store via `IVectorSearchService`. Retrieval: embed query → vector search → assemble context window (truncate to fit MaxTokens). Chunked document indexing runs as Hangfire background job for large documents. |
| 8.4 | Build MCP Server | `McpServer` hosted service, tool registry | **McpServer**: ASP.NET Core hosted service that implements the MCP protocol over HTTP SSE. Endpoints: `GET /mcp/tools` — list registered tools, `POST /mcp/execute` — execute tool by name + input args. **ToolRegistry**: reflection-based scan for `[McpTool]` attribute on classes. Each tool: `(Name, Description, JsonSchema InputSchema, Func<JsonElement, Task<JsonElement>> Handler)`. **McpToolLogs** table: TenantId, ToolName, Input (JSON), Result (JSON), ExecutedByUserId, ExecutedAt, DurationMs, IsError. Pre-seeded tools: `GetInstruments`, `SearchHelpArticles`, `GetUserCompetencies`, `GetInstrumentStatus` (returns mock if M4 not ready). DI: `AddMcpTools()`. |
| 8.5 | Build M1: AI Helpdesk — chat endpoint | `HelpdeskHub` (SignalR), `HelpdeskController` | **HelpdeskHub** (`/hubs/helpdesk`): Methods — `SendMessage(conversationId, message)` — user sends message → loads conversation history from DB → calls `ILlmService.StreamChatAsync` → streams response tokens back via `ReceiveToken` → on complete, saves to `HelpdeskMessages` and emits `MessageComplete`. `StartConversation(topic)` — creates new `HelpdeskConversation`. `GetHistory(conversationId)` — returns message list. Group membership by tenant: `Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}")`. **HelpdeskConversations** table: TenantId, UserId, Topic, Status (Open/Closed/PendingTicket), CreatedAt, ClosedAt. **HelpdeskMessages** table: ConversationId, Role (User/Assistant/System), Content, TokensUsed, CreatedAt. API: `GET /api/v1/ai/helpdesk/conversations` (list user's conversations), `GET /api/v1/ai/helpdesk/conversations/{id}` (get with messages). |
| 8.6 | Build M1: Ticket creation from chat | Auto-create issue/ticket | When user types "create ticket" or AI detects escalation need, `HelpdeskController` offers `POST /api/v1/ai/helpdesk/conversations/{id}/create-ticket`. **HelpdeskTickets** table: TenantId, ConversationId, ConversationSummary, Priority (Low/Medium/High/Critical), Category, AssignedToUserId, Status (New/Assigned/InProgress/Resolved/Closed), CreatedAt, ResolvedAt. Auto-fill from conversation context: AI extracts category + priority from last messages. Publishes `TicketCreatedEvent` via MassTransit — consumed by Issues module (Phase 4) or notification service. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 8.18 | Build M1: Helpdesk chat interface | `HelpdeskChat.tsx` — Route: `/ai/helpdesk`. Full-page chat UI: conversation list (left sidebar), message bubble panel (center), input box (bottom). Message bubbles: user (right-aligned), assistant (left-aligned with avatar). Streaming token display (incremental text as tokens arrive via SignalR). Citations in tooltip/clickable links (from RAG sources). File upload button (attach SOPs/manuals as context). "Create Ticket" button appears in message actions. Empty state: suggested prompts ("How do I book an instrument?", "Show my upcoming bookings"). Typing indicator. Conversation history loaded on mount. |
| 8.19 | Build M1: Ticket creation dialog | `CreateTicketDialog.tsx` — Modal triggered from chat "Create Ticket" action or manually. Pre-filled: summary from conversation, AI-suggested category + priority (editable). Fields: Title, Description (rich text), Category dropdown, Priority selector (with color), Assignee search (optional). "Create" button → calls `POST /api/v1/ai/helpdesk/conversations/{id}/create-ticket` → shows success + link to ticket. |

**Sprint 1 Deliverables:** `ILlmService` (Ollama + OpenAI), `IVectorSearchService` (Azure AI Search + InMemory), `IRagService` (chunk → embed → store → retrieve), MCP Server with tool registry, `HelpdeskHub` (SignalR streaming chat), HelpdeskConversations + HelpdeskMessages tables, ticket creation from chat, HelpdeskChat.tsx streaming UI, CreateTicketDialog.tsx.

---

### Sprint 2 — M2: Talk-to-Action + M3: Equipment FAQ/KB (Weeks 25–26, Days 11–20)

**Theme:** Intent classification → system command execution with dry-run and guardrails, SOP/manual indexing, QR-linked context FAQ.

#### Backend Tasks — `Services/AiServices/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 8.7 | Build M1: SLA + performance dashboard data | Helpdesk metrics aggregation | `HelpdeskMetricsService`: aggregates per-tenant KPIs — AvgFirstResponseTime, AvgResolutionTime, TicketsByStatus, TicketsByPriority, ConversationCount, TicketsCreatedFromChat(%). API: `GET /api/v1/ai/helpdesk/metrics?from=&to=` returns `HelpdeskMetricsDto`. Data sourced from `HelpdeskConversations` + `HelpdeskTickets` tables. Optional Hangfire job for hourly rollup. |
| 8.8 | Build M2: Talk-to-Action — intent classification | `IActionOrchestrator` — NL → system command | **IActionOrchestrator**: `Task<ActionPlan> ParseIntentAsync(string utterance, UserContext context)`. Uses LLM with structured output (function calling or JSON mode) to classify intent. Intent schema: `{intent: string, confidence: float, parameters: {key: value}, targetTool: string | null}`. Pre-defined intents: `BookInstrument`, `CheckAvailability`, `OrderConsumable`, `SubmitServiceRequest`, `CheckCompetencyStatus`, `GetInstrumentStatus`, `CreateAnnouncement`, unknown. **ActionPlan**: `(Intent, Parameters, Confidence, SuggestedTool, DryRunResult, RequiresApproval)`. Returns action plan without executing. |
| 8.9 | Build M2: Dry-run preview engine | Dry-run simulates action without execution | For each supported intent, dry-run handler generates a human-readable preview: "You are about to book [Instrument X] on [date] from [time] to [time]. Estimated cost: $[amount]. Prerequisites: ✅ all met." Uses real data queries (read-only) to assemble preview. For dangerous actions (e.g., `DeactivateInstrument`), marks `RequiresApproval = true`. API: `POST /api/v1/ai/talk-to-action/dry-run` — takes utterance, returns `ActionPlanPreview`. |
| 8.10 | Build M2: Safe-action guardrails | `IGuardrailService` — prohibit dangerous actions | **IGuardrailService**: `Task<GuardrailResult> EvaluateAsync(ActionPlan plan, UserContext context)`. Guardrails: **Role check** — user's role must permit the action (RBAC). **Scope check** — user's tenant scope matches target. **Dangerous action check** — operations that modify equipment state, delete data, or incur > $X cost require approval. **Rate limit** — max N actions per minute per user. Returns `GuardrailResult(IsAllowed, BlockedReason, RequiresApproval, ApproverRoles)`. Guardrail rules stored in `GuardrailConfig` table (or appsettings for v1). |
| 8.11 | Build M3: Equipment FAQ — SOP/manual indexing | Index SOP PDFs → vector DB | **SopIndexingService**: reads SOP PDFs from MinIO/Blob Storage, extracts text (via `PdfTextExtractor` or Azure Document Intelligence), chunks and indexes via `IRagService`. API: `POST /api/v1/ai/faq/index-sop` — accepts file upload + instrumentId. Hangfire job `SopIndexingJob` processes queue. Metadata tags: instrumentId, documentType (Sop/Manual/SafetySheet), version. |
| 8.12 | Build M3: QR-linked contextual FAQ | QR code → instrument → relevant FAQ retrieval | API: `GET /api/v1/ai/faq/qr?instrumentId={id}` — returns top FAQ items (question + answer + source) for the scanned instrument. Pre-computed: when instrument is scanned via QR, fetch relevant chunks from vector DB filtered by `instrumentId`. Falls back to generic help articles if no instrument-specific content indexed. Aggregated view: instrument name/model, 3–5 most relevant Q&A items, link to full SOP, link to open helpdesk chat pre-seeded with instrument context. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 8.20 | Build M1: Helpdesk SLA dashboard | `HelpdeskSlaDashboard.tsx` — Route: `/ai/helpdesk/sla` (admin). KPI cards: Avg First Response Time, Avg Resolution Time, Open Tickets, Tickets Created from Chat %. Line chart: ticket volume over time (by status). Table: open tickets with assignee, priority, elapsed time. Queue management: assign, reassign, close. Filter by date range, priority, status. |
| 8.21 | Build M2: Talk-to-Action interface | `TalkToAction.tsx` — Route: `/ai/talk-to-action`. Command input (large textarea, similar to chat input). On submit: calls `POST /api/v1/ai/talk-to-action/dry-run`. Shows **preview card** with action summary, parameters (editable before confirm), cost estimate, prerequisite status, guardrail warnings (if any). Confirm button → executes action. Historical command list below: recent actions with status (Completed/Blocked/PendingApproval), timestamp, result summary. |
| 8.22 | Build M2: Action history log | `ActionHistory.tsx` — Route: `/ai/action-history`. Full paginated table of all NL-driven actions: utterance, resolved intent, parameters, status (Completed/Blocked/Failed/PendingApproval), guardrail result, execution result, timestamp. Filter by intent type, status, date range. Click row → detail view with full request/response. Export to CSV. |
| 8.23 | Build M3: Equipment FAQ page | `EquipmentFaq.tsx` — Route: `/ai/faq`. Search bar (searches vector index across all SOPs/manuals). Browse by instrument (dropdown/autocomplete). Per-instrument FAQ view: instrument details (from Facilities service), list of Q&A pairs with expand/collapse, link to full SOP viewer. QR scan shortcut (opens camera for QR code → navigates to instrument FAQ). Empty state: "No SOPs indexed yet. Upload manuals to get started." |
| 8.24 | Build M3: SOP viewer | `SopViewer.tsx` — Embedded PDF viewer (react-pdf or PDF.js). Citation highlights: when opened from FAQ search result, scrolls to relevant page/section. Download PDF. Request revision button (opens helpdesk chat with "Request SOP revision for [instrument]"). |

**Sprint 2 Deliverables:** Helpdesk SLA metrics aggregation + dashboard, intent classification engine, dry-run preview, guardrail service, SOP/manual indexing pipeline, QR-linked FAQ API, TalkToAction.tsx with preview/confirm flow, ActionHistory.tsx, EquipmentFaq.tsx, SopViewer.tsx.

---

### Sprint 3 — M4: IoT Automation + Integration Tests (Weeks 27–28, Days 21–30)

**Theme:** OPC-UA / MQTT / Modbus ingestion, threshold alert engine, soft→hard action automation, IoT security layer, integration tests for all Phase 8 modules.

#### Backend Tasks — `Services/AiServices/`

| ID | Task | Deliverable | Details |
|:--:|------|-------------|---------|
| 8.13 | Build M4: IoT Ingestion pipeline | `IIoTIngestionService` — protocol adapters | **IIoTIngestionService**: `Task IngestAsync(IoTTelemetryPoint point)`. Protocol adapters: **OpcUaAdapter** — connects to OPC-UA server, subscribes to monitored items, pushes telemetry via `IIoTIngestionService`. Uses `OPCFoundation.NetStandard.Opc.Ua` client. **MqttAdapter** — subscribes to MQTT topics (`instruments/{instrumentId}/telemetry`), parses JSON payload. Uses `MQTTnet`. **ModbusAdapter** — polls Modbus TCP slaves on configurable interval, reads holding registers, maps to metrics via config. Uses `EasyModbus`. **IoTTelemetry** table: TenantId, InstrumentId, Timestamp (datetime2), MetricName (varchar(100)), MetricValue (float), Unit (varchar(50)), Tags (nvarchar(max) — JSON). Clustered columnstore index recommendation for time-series query performance. Config via `IoTSettings` section: enabled protocols, connection strings, polling intervals. |
| 8.14 | Build M4: Threshold-based alert engine | `IAlertEngine` — compare telemetry vs thresholds | **IAlertEngine**: `Task EvaluateAsync(IoTTelemetryPoint point)` — evaluates new telemetry against active alert rules. **IoTRule** table: TenantId, InstrumentId, MetricName, ConditionType (AbsoluteAbove/AbsoluteBelow/RateOfIncrease/RateOfDecrease/DeviationFromAvg), ThresholdValue, EvaluationWindowMinutes (for rate/deviation), Severity (Warning/Critical), CooldownMinutes (prevent alert storms), IsEnabled. On breach: creates `IoTAlert` record, publishes `IoTTAlertCreatedEvent` via MassTransit. **IoTAlert** table: TenantId, InstrumentId, RuleId, MetricName, ActualValue, ThresholdValue, Severity, Status (Open/Acknowledged/Resolved/Snoozed), OpenedAt, AcknowledgedAt, ResolvedAt, ResolvedByUserId. Notification via `INotificationService` to configured recipients. |
| 8.15 | Build M4: Soft→hard action automation | Automated equipment control with safety gates | **IAutomationService**: `Task<AutomationResult> ExecuteAsync(AutomationAction action)`. **AutomationRules** table: TenantId, Name, TriggerType (AlertBreach/Schedule/TelemetryPattern), TriggerConfig (JSON — which alert rule, cron expression, or pattern), ActionType (SoftAction/HardAction), ActionConfig (JSON — e.g., `{command: "SetTemperature", targetValue: 25, instrumentId: "..."}`), RequiresApproval (true for hard actions), IsEnabled, CreatedAt. **Safety gates** (for hard actions): action is queued for approval → designated approver receives notification → approve/reject via API (`PUT /api/v1/ai/iot/automation-rules/{id}/pending-actions/{actionId}/approve`). **Soft actions** (notification, log, display warning): execute automatically. **Hard actions** (change equipment state, power off, adjust setpoint): require approval. Automation execution logged in `AutomationLogs` table. |
| 8.16 | Build M4: IoT security layer | Device authentication, encrypted channels | Device authentication: pre-shared API keys per instrument (`InstrumentApiKeys` table), validated via middleware on telemetry ingestion endpoint. TLS mutual authentication for OPC-UA (client certificate). MQTT TLS encryption + username/password authentication. API key rotation endpoint (admin only). All telemetry ingestion behind `[Authorize]` with `IoTRole` policy. Audit log of all API key usage. |
| 8.17 | Integration tests | xUnit + Testcontainers tests | Create `AiServicesWebApplicationFactory` (Sqlite in-memory). Test classes: **LlmServiceTests** — mock HTTP handler returns expected chat/embedding responses, verify streaming works. **RagPipelineTests** — chunk text → embed (mock) → store → search → retrieve. **McpToolTests** — tool registry discovers tools, execute tool with valid/invalid args, audit logged. **HelpdeskTests** — conversation CRUD, send message, stream response, create ticket from chat. **TalkToActionTests** — intent classification (mock LLM), dry-run preview, guardrail blocks unauthorized action. **SopIndexingTests** — index PDF → search FAQ → retrieve by instrument. **IoTIngestionTests** — ingest telemetry → verify stored. **AlertEngineTests** — thresholds breach → alert created, cooldown prevents storm, severity escalation. **AutomationRuleTests** — soft action auto-executes, hard action requires approval. |

#### Frontend Tasks

| ID | Task | Deliverable |
|:--:|------|-------------|
| 8.25 | Build M4: IoT Dashboard (real-time telemetry) | `IoTDashboard.tsx` — Route: `/ai/iot`. Instrument selector (dropdown with search). Real-time gauges (SVG circular gauges or linear gauges) for key metrics: temperature, pressure, RPM, power consumption, etc. Live-updating line chart (last hour of selected metric, updates via polling or SignalR). Status indicators (Online/Offline/Warning/Critical) per instrument. Alert banner at top for active critical alerts. Quick action buttons per instrument (if automation rules configured). |
| 8.26 | Build M4: Alert management page | `IoTAlerts.tsx` — Route: `/ai/iot/alerts`. Table of alerts: severity badge (Critical/Warning), instrument, metric, actual vs threshold value, timestamp, status. Filter by severity, status, instrument, date range. Bulk acknowledge. Single-click resolve (with confirmation). Alert detail drawer: history of same metric, related alerts, suggested actions (from automation rules). |
| 8.27 | Build M4: Automated action configuration | `AutomationRules.tsx` — Route: `/ai/iot/automation`. Rule list: name, trigger type, action type, enabled/disabled toggle. Create/edit rule form: **Trigger** section — select trigger type (Alert Breach → select alert rule, Schedule → cron builder, Telemetry Pattern → metric + pattern). **Action** section — select action type (Soft: Send Notification, Log Event; Hard: Set Temperature, Power Off, Calibrate) + target value + instrument. **Safety** toggle (requires approval for hard actions). **Approver** selection (role or specific users). Test rule button (dry-run). |

**Sprint 3 Deliverables:** IoT ingestion pipeline (OPC-UA, MQTT, Modbus adapters), threshold alert engine + `IoTAlerts` table, automation rules engine with safety gates, IoT security layer (API key auth + TLS), IoTDashboard.tsx (real-time gauges + charts), IoTAlerts.tsx (management page), AutomationRules.tsx (if-then rule builder), integration tests (9 test classes).

---

## New / Extended Entity Structures

### New `Services/AiServices/ResearchLms.AiServices.Domain/`

```
├── Entities/
│   ├── HelpdeskConversation.cs
│   ├── HelpdeskMessage.cs
│   ├── HelpdeskTicket.cs
│   ├── ActionLog.cs
│   ├── McpToolLog.cs
│   ├── IoTTelemetry.cs
│   ├── IoTAlert.cs
│   ├── IoTRule.cs
│   ├── AutomationRule.cs
│   └── InstrumentApiKey.cs
├── Enums/
│   ├── ConversationStatus.cs          (Open, Closed, PendingTicket)
│   ├── TicketPriority.cs              (Low, Medium, High, Critical)
│   ├── TicketStatus.cs                (New, Assigned, InProgress, Resolved, Closed)
│   ├── AlertSeverity.cs               (Warning, Critical)
│   ├── AlertStatus.cs                 (Open, Acknowledged, Resolved, Snoozed)
│   ├── AutomationActionType.cs        (SoftAction, HardAction)
│   ├── GuardrailResultCode.cs         (Allowed, Blocked, RequiresApproval)
│   └── LlmProvider.cs                 (Ollama, OpenAI)
├── ValueObjects/
│   ├── ChatMessage.cs                 (Role, Content)
│   ├── LlmConfig.cs                   (Model, Temperature, MaxTokens, TopP)
│   ├── RagDocument.cs                 (Id, Title, Content, SourceType, SourceUrl, InstrumentId)
│   ├── RagResult.cs                   (ChunkContent, Score, Source, Metadata)
│   ├── ActionPlan.cs                  (Intent, Parameters, Confidence, DryRunResult, RequiresApproval)
│   ├── GuardrailResult.cs             (IsAllowed, BlockedReason, RequiresApproval, ApproverRoles)
│   └── IoTTelemetryPoint.cs           (InstrumentId, Timestamp, MetricName, Value, Unit, Tags)
└── Interfaces/
    ├── ILlmService.cs
    ├── IVectorSearchService.cs
    ├── IRagService.cs
    ├── IActionOrchestrator.cs
    ├── IGuardrailService.cs
    ├── IIoTIngestionService.cs
    ├── IAlertEngine.cs
    └── IAutomationService.cs
```

### New `Services/AiServices/ResearchLms.AiServices.Application/`

```
├── Commands/
│   ├── Helpdesk/
│   │   ├── StartConversationCommand.cs
│   │   ├── SendMessageCommand.cs
│   │   └── CreateTicketFromConversationCommand.cs
│   ├── TalkToAction/
│   │   ├── DryRunActionCommand.cs
│   │   └── ExecuteActionCommand.cs
│   ├── Faq/
│   │   └── IndexSopDocumentCommand.cs
│   └── Iot/
│       ├── CreateAlertRuleCommand.cs
│       ├── AcknowledgeAlertCommand.cs
│       ├── CreateAutomationRuleCommand.cs
│       └── ApproveAutomationActionCommand.cs
├── Queries/
│   ├── Helpdesk/
│   │   ├── GetConversationsQuery.cs
│   │   ├── GetConversationByIdQuery.cs
│   │   └── GetHelpdeskMetricsQuery.cs
│   ├── TalkToAction/
│   │   └── GetActionHistoryQuery.cs
│   ├── Faq/
│   │   ├── SearchFaqQuery.cs
│   │   └── GetInstrumentFaqQuery.cs
│   └── Iot/
│       ├── GetTelemetryQuery.cs
│       ├── GetAlertsQuery.cs
│       ├── GetAlertRulesQuery.cs
│       └── GetAutomationRulesQuery.cs
├── DTOs/
│   ├── ConversationDto.cs
│   ├── MessageDto.cs
│   ├── TicketDto.cs
│   ├── HelpdeskMetricsDto.cs
│   ├── ActionPlanDto.cs
│   ├── ActionLogEntryDto.cs
│   ├── FaqItemDto.cs
│   ├── IoTTelemetryDto.cs
│   ├── IoTAlertDto.cs
│   ├── AlertRuleDto.cs
│   └── AutomationRuleDto.cs
├── Validators/
│   ├── CreateTicketFromConversationValidator.cs
│   ├── DryRunActionValidator.cs
│   ├── IndexSopDocumentValidator.cs
│   └── CreateAlertRuleValidator.cs
└── Services/
    ├── ILlmService.cs
    ├── IRagService.cs
    ├── IVectorSearchService.cs
    ├── IActionOrchestrator.cs
    ├── IGuardrailService.cs
    ├── IAlertEngine.cs
    ├── IAutomationService.cs
    └── IHelpdeskMetricsService.cs
```

### New `Services/AiServices/ResearchLms.AiServices.Infrastructure/`

```
├── Persistence/
│   ├── AiServicesDbContext.cs
│   └── EntityConfigurations/
│       ├── HelpdeskConversationConfiguration.cs
│       ├── HelpdeskMessageConfiguration.cs
│       ├── HelpdeskTicketConfiguration.cs
│       ├── ActionLogConfiguration.cs
│       ├── McpToolLogConfiguration.cs
│       ├── IoTTelemetryConfiguration.cs
│       ├── IoTAlertConfiguration.cs
│       ├── IoTRuleConfiguration.cs
│       ├── AutomationRuleConfiguration.cs
│       └── InstrumentApiKeyConfiguration.cs
├── Services/
│   ├── Llm/
│   │   ├── OllamaLlmService.cs
│   │   └── OpenAiLlmService.cs
│   ├── VectorSearch/
│   │   ├── AzureAISearchService.cs
│   │   └── InMemoryVectorService.cs
│   ├── Rag/
│   │   └── RagService.cs
│   ├── Mcp/
│   │   ├── McpServer.cs
│   │   ├── ToolRegistry.cs
│   │   └── Tools/
│   │       ├── GetInstrumentsTool.cs
│   │       ├── SearchHelpArticlesTool.cs
│   │       ├── GetUserCompetenciesTool.cs
│   │       └── GetInstrumentStatusTool.cs
│   ├── Helpdesk/
│   │   ├── HelpdeskMetricsService.cs
│   │   └── HelpdeskHub.cs
│   ├── TalkToAction/
│   │   ├── ActionOrchestrator.cs
│   │   └── GuardrailService.cs
│   ├── Faq/
│   │   └── SopIndexingService.cs
│   └── Iot/
│       ├── IoTOIngestionService.cs
│       ├── Adapters/
│       │   ├── OpcUaAdapter.cs
│       │   ├── MqttAdapter.cs
│       │   └── ModbusAdapter.cs
│       ├── AlertEngine.cs
│       ├── AutomationService.cs
│       └── Security/
│           └── DeviceAuthMiddleware.cs
└── DependencyInjection.cs
```

### New `Services/AiServices/ResearchLms.AiServices.Api/`

```
├── Controllers/
│   ├── HelpdeskController.cs
│   ├── TalkToActionController.cs
│   ├── FaqController.cs
│   └── IoToController.cs
├── Hubs/
│   └── HelpdeskHub.cs
└── Program.cs
```

---

## Frontend Module Structure (New)

```
frontend/src/modules/ai-modules/
├── pages/
│   ├── HelpdeskChat.tsx              (Sprint 1 — Route: /ai/helpdesk)
│   ├── HelpdeskSlaDashboard.tsx      (Sprint 2 — Route: /ai/helpdesk/sla)
│   ├── TalkToAction.tsx              (Sprint 2 — Route: /ai/talk-to-action)
│   ├── ActionHistory.tsx             (Sprint 2 — Route: /ai/action-history)
│   ├── EquipmentFaq.tsx              (Sprint 2 — Route: /ai/faq)
│   ├── SopViewer.tsx                 (Sprint 2 — Route: /ai/faq/sop/:id)
│   ├── IoTDashboard.tsx              (Sprint 3 — Route: /ai/iot)
│   ├── IoTAlerts.tsx                 (Sprint 3 — Route: /ai/iot/alerts)
│   └── AutomationRules.tsx           (Sprint 3 — Route: /ai/iot/automation)
├── components/
│   ├── helpdesk/
│   │   ├── ConversationList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── CreateTicketDialog.tsx
│   ├── talk-to-action/
│   │   ├── ActionPreviewCard.tsx
│   │   └── GuardrailWarning.tsx
│   ├── faq/
│   │   ├── FaqSearchBar.tsx
│   │   └── InstrumentFaqList.tsx
│   └── iot/
│       ├── TelemetryGauge.tsx
│       ├── LiveTelemetryChart.tsx
│       ├── AlertBadge.tsx
│       ├── AlertTable.tsx
│       └── AutomationRuleForm.tsx
└── hooks/
    ├── useHelpdeskHub.ts             (SignalR hook for helpdesk chat)
    └── useIoTTop telemetry.ts         (Polling or SignalR for live telemetry)
```

---

## API Routes (New)

### AI Helpdesk — `/api/v1/ai/helpdesk`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/conversations` | List user's conversations (paginated) |
| GET | `/conversations/{id}` | Get conversation with messages |
| POST | `/conversations` | Start new conversation |
| POST | `/conversations/{id}/messages` | Send message (REST fallback — primary is SignalR) |
| POST | `/conversations/{id}/create-ticket` | Create ticket from conversation context |
| GET | `/tickets` | List tickets (paginated, filterable) |
| GET | `/tickets/{id}` | Get ticket details |
| PUT | `/tickets/{id}/status` | Update ticket status |
| GET | `/metrics` | SLA dashboard metrics |

### Talk-to-Action — `/api/v1/ai/talk-to-action`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/dry-run` | Parse intent + return action plan preview |
| POST | `/execute` | Confirm and execute action |
| GET | `/history` | List action history (paginated, filterable) |

### Equipment FAQ — `/api/v1/ai/faq`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/search?q={query}&instrumentId={id}` | Search FAQ (vector search across SOPs/manuals) |
| GET | `/instruments/{id}` | Get FAQ for specific instrument (QR context) |
| POST | `/index-sop` | Upload and index SOP PDF |
| GET | `/sops/{id}` | Get SOP metadata + download URL |

### IoT — `/api/v1/ai/iot`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/telemetry` | Ingest telemetry point (authenticated device) |
| GET | `/telemetry?instrumentId={id}&metric={name}&from=&to=` | Query telemetry history |
| GET | `/instruments/{id}/status` | Latest telemetry + status for instrument |
| GET | `/alerts` | List alerts (paginated, filterable) |
| PUT | `/alerts/{id}/acknowledge` | Acknowledge alert |
| PUT | `/alerts/{id}/resolve` | Resolve alert |
| GET | `/alert-rules` | List alert threshold rules |
| POST | `/alert-rules` | Create alert rule |
| PUT | `/alert-rules/{id}` | Update alert rule |
| DELETE | `/alert-rules/{id}` | Delete alert rule |
| GET | `/automation-rules` | List automation rules |
| POST | `/automation-rules` | Create automation rule |
| PUT | `/automation-rules/{id}` | Update automation rule |
| DELETE | `/automation-rules/{id}` | Delete automation rule |
| POST | `/automation-rules/{id}/test` | Dry-run rule |
| GET | `/automation-rules/pending-actions` | List pending hard-action approvals |
| PUT | `/automation-rules/pending-actions/{id}/approve` | Approve pending action |
| PUT | `/automation-rules/pending-actions/{id}/reject` | Reject pending action |

### MCP Server — `/mcp`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/mcp/tools` | List all registered MCP tools |
| POST | `/mcp/execute` | Execute a tool by name |

### SignalR Hubs

| Hub | Route | Events |
|-----|-------|--------|
| HelpdeskHub | `/hubs/helpdesk` | SendMessage → ReceiveToken, MessageComplete, Error |
| IoTDataHub | `/hubs/iot` | (optional) TelemetryUpdate, AlertCreated |

---

## DB Schema (New Database: AiServicesDb)

| Table | Key Columns | Notes |
|-------|------------|-------|
| `HelpdeskConversations` | TenantId, UserId, Topic, Status (Open/Closed/PendingTicket), CreatedAt, ClosedAt | Chat sessions |
| `HelpdeskMessages` | ConversationId (FK), Role (User/Assistant/System), Content, TokensUsed, CreatedAt | Individual messages |
| `HelpdeskTickets` | TenantId, ConversationId (FK), Summary, Priority, Category, AssignedToUserId, Status, CreatedAt, ResolvedAt | Tickets created from chat |
| `ActionLogs` | TenantId, UserId, Utterance, Intent, Parameters (JSON), Status (Completed/Blocked/Failed/Pending), GuardrailResult (JSON), ExecutionResult (JSON), DurationMs, CreatedAt | NL-driven action history |
| `GuardrailConfig` | TenantId, ActionType, IsBlocked, RequiresApproval, ApproverRoles (JSON), MaxRatePerMinute, CreatedAt | Guardrail rule definitions |
| `McpToolLogs` | TenantId, ToolName, Input (JSON), Result (JSON), ExecutedByUserId, DurationMs, IsError, ExecutedAt | MCP tool audit trail |
| `IoTTelemetry` | TenantId, InstrumentId, Timestamp (datetime2), MetricName, MetricValue (float), Unit, Tags (JSON) | Time-series telemetry (clustered columnstore index recommended) |
| `IoTAlerts` | TenantId, InstrumentId, RuleId (FK), MetricName, ActualValue, ThresholdValue, Severity, Status, OpenedAt, AcknowledgedAt, ResolvedAt, ResolvedByUserId | Alert records |
| `IoTRules` | TenantId, InstrumentId, MetricName, ConditionType, ThresholdValue, EvaluationWindowMinutes, Severity, CooldownMinutes, IsEnabled | Threshold definitions |
| `AutomationRules` | TenantId, Name, TriggerType, TriggerConfig (JSON), ActionType, ActionConfig (JSON), RequiresApproval, IsEnabled, CreatedAt | If-then automation rules |
| `AutomationActionLogs` | RuleId (FK), TriggerEvent (JSON), ActionExecuted (JSON), Status, ApprovedByUserId, ExecutedAt | Automation execution history |
| `InstrumentApiKeys` | TenantId, InstrumentId, ApiKeyHash, Description, IsActive, CreatedAt, ExpiresAt, LastUsedAt | IoT device auth keys |

---

## Caching Strategy

| Cache Target | Cache Store | Key | TTL | Invalidation |
|--------------|-------------|-----|:---:|:------------:|
| LLM response (identical queries) | `IMemoryCache` | `llm_{model}_{messageHash}` | 1 hour | Manual clear |
| Conversation list | `IMemoryCache` | `conv_{tenantId}_{userId}` | 1 min | On new message |
| FAQ search results | Redis | `faq_{queryHash}_{instrumentId}` | 30 min | On new SOP index |
| Telemetry latest values | `IMemoryCache` | `telemetry_latest_{instrumentId}` | 5 sec | On new ingestion |
| Alert rules | `IMemoryCache` | `alert_rules_{tenantId}` | 1 min | On rule CRUD |
| MCP tool list | `IMemoryCache` | `mcp_tools` | 5 min | On app restart |
| Active dashboards/widgets | Redis | `helpdesk_metrics_{tenantId}` | 5 min | On new ticket/message |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM latency (Ollama on CPU) degrades helpdesk UX | High | Use streaming (SSE/SignalR) so user sees tokens incrementally. Ollama GPU passthrough in Docker. Fallback to OpenAI for production. |
| Vector DB (Azure AI Search) not available in all environments | Medium | `InMemoryVectorService` for dev. Fallback to SQL Server with basic `LIKE` search for MVP. |
| OPC-UA / Modbus connectivity to real instruments not testable without hardware | Medium | Protocol adapter abstraction with mock implementations. Simulated telemetry generator for dev/test. Integration tests use mocked protocol adapters. |
| IoT telemetry volume (high-frequency sensors) causes DB performance issues | Medium | Clustered columnstore index. Downsampling on read (last 1h raw, last 24h 1-min avg, last 30d 1-hour avg). Retention policy (auto-purge raw > 90 days via Hangfire). |
| LLM hallucination in Talk-to-Action (incorrect intent/parameters) | High | Dry-run preview always shown before execution. Guardrails block dangerous actions. Action history for audit. User confirmation required for any state-changing action. |
| MCP server security (tool misuse by AI agents) | Medium | Tool registry with permission annotations. Audit log for all tool executions. Rate limiting per user per tool. Allowlist of approved tools per role. |
| SignalR connection limits for live telemetry | Medium | Throttle telemetry updates to 1/sec per client. Use Redis backplane for multi-instance SignalR. Consider dedicated IoT data hub separate from helpdesk hub. |

---

## Phase 7 → Phase 8 Handoff Checklist

- [x] Phase 7 modules complete: Training (competencies, prerequisites), Communications (notifications, SignalR, templates, announcements), Content (help articles, walkthroughs, publications, homepage builder)
- [x] Integration test infrastructure (`ContentWebApplicationFactory`) operational
- [x] Shared infrastructure (Hangfire, MassTransit, SignalR, Redis, Docker Compose, YARP) operational
- [x] Frontend modules scaffolded: training, announcements, notifications, help, publications, admin
- [x] New routes added to `App.tsx` and sidebar navigation for Phase 7 modules
- [ ] `Services/AiServices/` microservice scaffolded with Domain/Application/Infrastructure/Api layers
- [ ] Docker Compose updated: Ollama service added (with model download), Azure AI Search emulator or InMemoryVectorService configured
- [ ] `ILlmService` (Ollama + OpenAI) registered in DI
- [ ] `IVectorSearchService` + `IRagService` registered in DI
- [ ] MCP Server hosted service registered
- [ ] SignalR hub `/hubs/helpdesk` configured
- [ ] IoT protocol adapter NuGet packages added: `OPCFoundation.NetStandard.Opc.Ua`, `MQTTnet`, `EasyModbus`
- [ ] `ILlmService` implementation can be switched between Ollama and OpenAI via configuration
- [ ] EF Core migration for `AiServicesDb` generated (all 12 tables)
- [ ] Frontend `modules/ai-modules/` directory scaffolded with pages + components
- [ ] Frontend `useHelpdeskHub` SignalR hook created
- [ ] New routes (`/ai/helpdesk`, `/ai/talk-to-action`, `/ai/faq`, `/ai/iot`) added to `App.tsx` and sidebar navigation
- [ ] Integration tests for all Phase 8 modules passing
