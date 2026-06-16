using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Facilities.Api;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests;

public class FacilityWebApplicationFactory : WebApplicationFactory<FacilityProgram>
{
    private static readonly SqliteConnection _sharedConnection;

    static FacilityWebApplicationFactory()
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
                var cu = new TestCurrentUser();
                cu.SetUser(Guid.NewGuid(), "test@researchlms.com", "Test User", ["Admin"], Guid.Empty);
                return cu;
            });
        });
    }

    public async Task SeedTestDataAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ResearchLmsDbContext>();
        var tenantContext = scope.ServiceProvider.GetRequiredService<ITenantContext>();
        await context.Database.EnsureCreatedAsync();
        await SeedData.SeedAsync(context, tenantContext);
    }
}

public class TestCurrentUser : ICurrentUser
{
    public Guid UserId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string[] Roles { get; private set; } = [];
    public Guid TenantId { get; private set; }
    public bool IsAuthenticated => UserId != Guid.Empty;

    public void SetUser(Guid userId, string email, string name, string[] roles, Guid tenantId)
    {
        UserId = userId;
        Email = email;
        Name = name;
        Roles = roles;
        TenantId = tenantId;
    }
}
