using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ServiceWorkflowDbContext>
{
    public ServiceWorkflowDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ServiceWorkflowDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=ServiceWorkflowDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new ServiceWorkflowDbContext(optionsBuilder.Options);
    }
}
