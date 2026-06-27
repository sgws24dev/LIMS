using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests;

public class BillingWebApplicationFactory : WebApplicationFactory<BillingProgram>
{
    private static readonly SqliteConnection _sharedConnection;

    static BillingWebApplicationFactory()
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
                cu.SetUser(Guid.NewGuid(), "billing-test@test.com", "Billing Test", ["BillingAdmin"], Guid.Empty);
                return cu;
            });
        });
    }

    public async Task SeedAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
        await context.Database.EnsureCreatedAsync();
    }
}
