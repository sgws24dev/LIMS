using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.Compliance.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ComplianceDbContext>
{
    public ComplianceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ComplianceDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=ComplianceDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new ComplianceDbContext(optionsBuilder.Options);
    }
}
