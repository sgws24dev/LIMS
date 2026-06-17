using System.Net.Http.Headers;
using System.Text;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Projects.Domain.Interfaces;
using ResearchLms.Projects.Infrastructure.BackgroundJobs;
using ResearchLms.Projects.Infrastructure.Persistence;
using ResearchLms.Projects.Infrastructure.Repositories;
using ResearchLms.Projects.Infrastructure.Services;

namespace ResearchLms.Projects.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddProjectInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ProjectsDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("ProjectsDb")));

        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IWorkOrderRepository, WorkOrderRepository>();
        services.AddScoped<ICostCenterRepository, CostCenterRepository>();
        services.AddScoped<IIssueRepository, IssueRepository>();

        services.AddScoped<IIssueSyncService, ServiceNowSyncService>();
        services.AddScoped<IIssueSyncService, JiraSyncService>();
        services.AddScoped<IIssueSyncJob, IssueSyncJob>();

        services.AddHttpClient("ServiceNow", client =>
        {
            client.BaseAddress = new Uri(configuration["ServiceNow:BaseUrl"]
                ?? "https://dev.service-now.com");
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes(
                $"{configuration["ServiceNow:Username"]}:{configuration["ServiceNow:Password"]}"));
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", credentials);
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
        });

        services.AddHttpClient("Jira", client =>
        {
            client.BaseAddress = new Uri(configuration["Jira:BaseUrl"]
                ?? "https://yourorg.atlassian.net");
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes(
                $"{configuration["Jira:Email"]}:{configuration["Jira:ApiToken"]}"));
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", credentials);
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
        });

        return services;
    }
}
