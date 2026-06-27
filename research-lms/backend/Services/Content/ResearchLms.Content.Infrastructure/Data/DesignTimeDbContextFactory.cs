using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ContentDbContext>
{
    public ContentDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ContentDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=ContentDb;Trusted_Connection=True;TrustServerCertificate=True;");

        return new ContentDbContext(optionsBuilder.Options, new DesignTimeTenantContext());
    }
}

public class DesignTimeTenantContext : ITenantContext
{
    public Guid TenantId => Guid.Empty;
    public string TenantName => "DesignTime";
    public void SetTenant(Guid tenantId, string tenantName) { }
}
