using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.Persistence;

public class ResearchLmsDesignTimeDbContextFactory : IDesignTimeDbContextFactory<ResearchLmsDbContext>
{
    public ResearchLmsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ResearchLmsDbContext>();

        var connectionString = args.Length > 0
            ? args[0]
            : "Server=.\\SQLEXPRESS;Database=ResearchLms_Identity;Integrated Security=True;TrustServerCertificate=True;";

        optionsBuilder.UseSqlServer(connectionString);

        return new ResearchLmsDbContext(
            optionsBuilder.Options,
            new DesignTimeTenantContext(),
            new DesignTimeCurrentUser(),
            new DesignTimeServiceProvider());
    }

    private class DesignTimeTenantContext : ITenantContext
    {
        public Guid TenantId => Guid.Empty;
        public string TenantName => "DesignTime";
        public void SetTenant(Guid tenantId, string tenantName) { }
    }

    private class DesignTimeCurrentUser : ICurrentUser
    {
        public Guid UserId => Guid.Empty;
        public string Email => "design@time.com";
        public string Name => "DesignTime";
        public string[] Roles => Array.Empty<string>();
        public Guid TenantId => Guid.Empty;
        public bool IsAuthenticated => false;
    }

    private class DesignTimeServiceProvider : IServiceProvider
    {
        public object? GetService(Type serviceType) => null;
    }
}
