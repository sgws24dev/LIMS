using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.Scheduling.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<SchedulingDbContext>
{
    public SchedulingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<SchedulingDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=SchedulingDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new SchedulingDbContext(optionsBuilder.Options);
    }
}
