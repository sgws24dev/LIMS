using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;
using ResearchLms.AiServices.Application.Services;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Infrastructure.Persistence;
using ResearchLms.AiServices.Infrastructure.Persistence.Repositories;
using ResearchLms.AiServices.Infrastructure.Services.Helpdesk;
using ResearchLms.AiServices.Infrastructure.Services.Llm;
using ResearchLms.AiServices.Infrastructure.Services.Mcp;
using ResearchLms.AiServices.Infrastructure.Services.Mcp.Tools;
using ResearchLms.AiServices.Infrastructure.Services.Rag;
using ResearchLms.AiServices.Infrastructure.Services.Iot;
using ResearchLms.AiServices.Infrastructure.Services.Iot.Adapters;
using ResearchLms.AiServices.Infrastructure.Services.TalkToAction;
using ResearchLms.AiServices.Infrastructure.Services.VectorSearch;

namespace ResearchLms.AiServices.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAiServicesInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AiServicesDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("AiServicesDb")));

        services.AddScoped<IHelpdeskConversationRepository, HelpdeskConversationRepository>();
        services.AddScoped<IHelpdeskTicketRepository, HelpdeskTicketRepository>();
        services.AddScoped<IMcpToolLogRepository, McpToolLogRepository>();
        services.AddScoped<IHelpdeskMetricsService, HelpdeskMetricsService>();
        services.AddScoped<IGuardrailConfigRepository, GuardrailConfigRepository>();

        var llmProvider = configuration.GetValue<string>("Ai:Llm:Provider") ?? "Ollama";
        if (llmProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
        {
            services.AddHttpClient<ILlmService, OpenAiLlmService>(client =>
            {
                client.BaseAddress = new Uri(configuration["Ai:Llm:OpenAi:BaseUrl"] ?? "https://api.openai.com");
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {configuration["Ai:Llm:OpenAi:ApiKey"]}");
            })
            .AddTransientHttpErrorPolicy(policy =>
                policy.WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromMilliseconds(Math.Pow(2, retryAttempt) * 100)));
        }
        else
        {
            services.AddHttpClient<ILlmService, OllamaLlmService>(client =>
            {
                client.BaseAddress = new Uri(configuration["Ai:Llm:Ollama:BaseUrl"] ?? "http://localhost:11434");
            })
            .AddTransientHttpErrorPolicy(policy =>
                policy.WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromMilliseconds(Math.Pow(2, retryAttempt) * 100)));
        }

        var vectorProvider = configuration.GetValue<string>("Ai:VectorDb:Provider") ?? "InMemory";
        if (vectorProvider.Equals("AzureAISearch", StringComparison.OrdinalIgnoreCase))
        {
            services.AddScoped<IVectorSearchService, AzureAISearchService>();
        }
        else
        {
            services.AddSingleton<IVectorSearchService, InMemoryVectorService>();
        }

        services.AddScoped<IRagService, RagService>();

        services.AddSingleton<ToolRegistry>();
        services.AddSingleton(sp =>
        {
            var registry = sp.GetRequiredService<ToolRegistry>();
            registry.Register(GetInstrumentsTool.Create());
            registry.Register(SearchHelpArticlesTool.Create());
            registry.Register(GetUserCompetenciesTool.Create());
            registry.Register(GetInstrumentStatusTool.Create());
            return registry;
        });
        services.AddScoped<McpServer>();
        services.AddSingleton<McpHostedService>();
        services.AddHostedService(sp => sp.GetRequiredService<McpHostedService>());

        services.AddScoped<IActionLogRepository, ActionLogRepository>();
        services.AddScoped<IActionOrchestrator, ActionOrchestrator>();
        services.AddScoped<IGuardrailService, GuardrailService>();
        services.AddScoped<ISopIndexingService, SopIndexingService>();

        services.AddScoped<IIoTTelemetryRepository, IoTTelemetryRepository>();
        services.AddScoped<IIoTAlertRepository, IoTAlertRepository>();
        services.AddScoped<IIoTRuleRepository, IoTRuleRepository>();
        services.AddScoped<IAutomationRuleRepository, AutomationRuleRepository>();
        services.AddScoped<IAutomationActionLogRepository, AutomationActionLogRepository>();
        services.AddScoped<IInstrumentApiKeyRepository, InstrumentApiKeyRepository>();
        services.AddScoped<IIoTIngestionService, IoTIngestionService>();
        services.AddScoped<IAlertEngine, AlertEngine>();
        services.AddScoped<IAutomationService, AutomationService>();
        services.AddScoped<OpcUaAdapter>();
        services.AddScoped<MqttAdapter>();
        services.AddScoped<ModbusAdapter>();

        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration["RabbitMQ:Host"] ?? "localhost", h =>
                {
                    h.Username(configuration["RabbitMQ:Username"] ?? "guest");
                    h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
