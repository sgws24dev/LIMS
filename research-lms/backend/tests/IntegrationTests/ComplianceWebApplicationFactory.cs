using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Compliance.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests;

public class ComplianceWebApplicationFactory : WebApplicationFactory<ComplianceProgram>
{
    private static readonly SqliteConnection _sharedConnection;

    static ComplianceWebApplicationFactory()
    {
        _sharedConnection = new SqliteConnection("DataSource=:memory:");
        _sharedConnection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.AddSingleton(_sharedConnection);
            services.AddScoped<ICurrentUser>(_ =>
            {
                var cu = new CurrentUser();
                cu.SetUser(Guid.NewGuid(), "compliance-test@test.com", "Compliance Test", ["ComplianceAdmin"], Guid.Empty);
                return cu;
            });
            services.AddScoped<IChangeReasonProvider>(_ =>
            {
                var provider = new TestChangeReasonProvider();
                provider.SetChangeReason("Integration test change");
                return provider;
            });
        });
    }

    public async Task SeedAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ComplianceDbContext>();
        await context.Database.EnsureCreatedAsync();
    }
}

internal class TestChangeReasonProvider : IChangeReasonProvider
{
    public string? CurrentChangeReason { get; private set; }
    public void SetChangeReason(string reason) => CurrentChangeReason = reason;
}
