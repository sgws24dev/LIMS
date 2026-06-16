using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;
using ResearchLms.ServiceWorkflow.Infrastructure.Repositories;
using ResearchLms.ServiceWorkflow.Infrastructure.Services;
using ResearchLms.ServiceWorkflow.Infrastructure.Services.Actions;
using ResearchLms.ServiceWorkflow.Infrastructure.Services.Guards;

namespace ResearchLms.ServiceWorkflow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddServiceWorkflowInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ServiceWorkflowDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("ServiceWorkflowDb")));

        // Repositories
        services.AddScoped<IFormDefinitionRepository, FormDefinitionRepository>();
        services.AddScoped<IServiceRequestRepository, ServiceRequestRepository>();
        services.AddScoped<IMilestoneRepository, MilestoneRepository>();
        services.AddScoped<IApprovalRepository, ApprovalRepository>();
        services.AddScoped<IWorkflowDefinitionRepository, WorkflowDefinitionRepository>();
        services.AddScoped<IWorkflowInstanceRepository, WorkflowInstanceRepository>();
        services.AddScoped<INotificationRuleRepository, NotificationRuleRepository>();

        // Sprint 1 services
        services.AddScoped<IFormSchemaValidator, FormSchemaValidator>();
        services.AddScoped<IApprovalEngine, ApprovalEngine>();

        // Sprint 2 guards
        services.AddScoped<IWorkflowGuard, HasActiveApproverGuard>();
        services.AddScoped<IWorkflowGuard, IsNotExpiredGuard>();
        services.AddScoped<IWorkflowGuard, AlwaysPassGuard>();

        // Sprint 2 actions
        services.AddScoped<IWorkflowAction, SendApprovalEmailAction>();
        services.AddScoped<IWorkflowAction, UpdateStatusAction>();
        services.AddScoped<IWorkflowAction, LogTransitionAction>();

        // Sprint 2 services
        services.AddScoped<IWorkflowExecutionService, WorkflowExecutionService>();
        services.AddScoped<ISmtpEmailService, SmtpEmailService>();
        services.AddScoped<INotificationDispatcher, NotificationDispatcher>();

        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.Section));

        return services;
    }
}
