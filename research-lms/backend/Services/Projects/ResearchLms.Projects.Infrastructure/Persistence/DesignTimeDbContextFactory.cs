using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.Projects.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ProjectsDbContext>
{
    public ProjectsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ProjectsDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=ProjectsDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new ProjectsDbContext(optionsBuilder.Options);
    }
}
