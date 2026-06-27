using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.Communications.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<CommunicationsDbContext>
{
    public CommunicationsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<CommunicationsDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=CommunicationsDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new CommunicationsDbContext(optionsBuilder.Options);
    }
}
