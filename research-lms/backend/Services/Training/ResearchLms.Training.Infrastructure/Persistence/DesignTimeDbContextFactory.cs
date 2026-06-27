using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.Training.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<TrainingDbContext>
{
    public TrainingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TrainingDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=TrainingDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new TrainingDbContext(optionsBuilder.Options);
    }
}
