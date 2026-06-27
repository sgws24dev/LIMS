# Phase 8 Gaps — Todo List

## Progress: 16 / 16 items completed

### Legend
- [ ] = Pending
- [x] = Completed

---

## High Priority

- [x] **1. Add Polly retry policy to LLM services** (`8.1`)
  - Add `Microsoft.Extensions.Http.Polly` NuGet package
  - Configure retry (3 retries, exponential backoff) on OllamaLlmService and OpenAiLlmService HTTP clients
  - Files: `DependencyInjection.cs`, `ResearchLms.AiServices.Infrastructure.csproj`

- [x] **2. Add AzureAISearchService implementation** (`8.2`)
  - Implemented `AzureAISearchService` using `Azure.Search.Documents` SDK
  - Feature-flagged via `Ai:VectorDb:Provider` config (set to `AzureAISearch`)
  - Auto-creates index with vector search profile on first use
  - Falls back to `InMemoryVectorService` when provider is not `AzureAISearch`
  - Files: `AzureAISearchService.cs`, `DependencyInjection.cs`, `ResearchLms.AiServices.Infrastructure.csproj`
  - Implement `AzureAISearchService` using `Azure.Search.Documents` SDK
  - Feature-flagged via `Ai:VectorDb:Provider` config
  - Files: `AzureAISearchService.cs`, `DependencyInjection.cs`, `ResearchLms.AiServices.Infrastructure.csproj`

- [x] **3. Add remaining MCP tools** (`8.4`)
  - Implement `GetUserCompetenciesTool` — returns mock competency data
  - Implement `GetInstrumentStatusTool` — returns mock instrument status
  - Register both in `DependencyInjection.cs`
  - Files: `GetUserCompetenciesTool.cs`, `GetInstrumentStatusTool.cs`, `DependencyInjection.cs`

- [x] **4. Add IoT protocol adapters** (`8.13`)
  - Implement `OpcUaAdapter` (stub using `OPCFoundation.NetStandard.Opc.Ua`)
  - Implement `MqttAdapter` (using `MQTTnet`)
  - Implement `ModbusAdapter` (using `EasyModbus`)
  - Create `Iot/Adapters/` directory
  - Files: `OpcUaAdapter.cs`, `MqttAdapter.cs`, `ModbusAdapter.cs`

- [x] **5. Add IoT NuGet packages** (`8.13`)
  - Add `OPCFoundation.NetStandard.Opc.Ua`, `MQTTnet`, `EasyModbus` to csproj
  - File: `ResearchLms.AiServices.Infrastructure.csproj`

- [x] **6. Add DeviceAuthMiddleware for IoT security** (`8.16`)
  - Implement middleware that validates pre-shared API keys per instrument
  - Register in DI
  - Files: `DeviceAuthMiddleware.cs`, `Program.cs`

- [x] **7. Add Polly retry in DependencyInjection**
  - Wire up Polly policies to HTTP client registrations for LLM services
  - File: `DependencyInjection.cs`

## Medium Priority

- [x] **8. Add GuardrailConfig entity + table** (`8.10`)
  - Create `GuardrailConfig` entity with TenantId, ActionType, IsBlocked, RequiresApproval, ApproverRoles, MaxRatePerMinute
  - Create EF Core configuration
  - Add DbSet to `AiServicesDbContext`
  - Files: `GuardrailConfig.cs`, `GuardrailConfigConfiguration.cs`, `AiServicesDbContext.cs`

- [x] **9. Add GuardrailResultCode enum** (referenced in sprint plan Domain/Enums/)
  - Create `GuardrailResultCode.cs` enum with `Allowed`, `Blocked`, `RequiresApproval`
  - File: `GuardrailResultCode.cs`

- [x] **10. Create useIoTTopTelemetry frontend hook** (`8.25`)
  - Implement `useIoTTopTelemetry.ts` hook with polling for live telemetry
  - File: `useIoTTopTelemetry.ts`

- [x] **11. Add QR-specific FAQ endpoint** (`8.12`)
  - Add `GET /api/v1/ai/faq/qr?instrumentId={id}` endpoint
  - Returns top FAQ items + instrument details
  - Files: `FaqController.cs`

- [x] **12. Improve SopViewer with PDF display**
  - Add PDF viewer component using iframe/PDF.js
  - Add download button, citation highlights placeholder
  - File: `SopViewer.tsx`

- [x] **13. Add IHelpdeskMetricsService interface to Services folder** (`8.7`)
  - Interface, implementation, DTO, and DI registration all present and verified

## Low Priority

- [x] **14. Convert MCP server to hosted service** (`8.4`)
  - Implemented `McpHostedService` (BackgroundService) with SSE streaming
  - Added `GET /mcp/sse` and `POST /mcp/messages` minimal API endpoints
  - Kept `McpController` for backwards compatibility
  - Files: `McpHostedService.cs`, `DependencyInjection.cs`, `Program.cs`

- [x] **15. Wire TicketCreatedEvent via MassTransit** (`8.6`)
  - Created `TicketCreatedEvent` record in Shared/Events
  - Added MassTransit (RabbitMQ) registration in Infrastructure DI
  - Injected `IPublishEndpoint` into handler and publish on ticket creation
  - Files: `TicketCreatedEvent.cs`, `CreateTicketFromConversationCommand.cs`, `DependencyInjection.cs`

- [x] **16. Add IoTDataHub SignalR hub** (`8.25`)
  - Created `IoTDataHub` with Subscribe/Unsubscribe/GetLatestTelemetry methods
  - Registered at `/hubs/telemetry` in `Program.cs`
  - Files: `IoTDataHub.cs`, `Program.cs`
