using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AiServicesDbContext>
{
    public AiServicesDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AiServicesDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=AiServicesDb;Trusted_Connection=True;TrustServerCertificate=True;");

        return new AiServicesDbContext(optionsBuilder.Options, new DesignTimeTenantContext());
    }
}

public class DesignTimeTenantContext : ITenantContext
{
    public Guid TenantId => Guid.Empty;
    public string TenantName => "DesignTime";
    public void SetTenant(Guid tenantId, string tenantName) { }
}
