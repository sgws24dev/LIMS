using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.Billing.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<BillingDbContext>
{
    public BillingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<BillingDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=BillingDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new BillingDbContext(optionsBuilder.Options);
    }
}
