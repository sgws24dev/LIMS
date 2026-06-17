using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Projects.Domain.Entities;

namespace ResearchLms.Projects.Infrastructure.Persistence.EntityConfigurations;

public class CostCenterConfiguration : IEntityTypeConfiguration<CostCenter>
{
    public void Configure(EntityTypeBuilder<CostCenter> builder)
    {
        builder.ToTable("CostCenters");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Description).HasMaxLength(1000);
        builder.Property(c => c.ManagerName).HasMaxLength(200);
        builder.Property(c => c.BudgetAmount).HasPrecision(18, 2);
        builder.Property(c => c.SpentAmount).HasPrecision(18, 2);
        builder.Property(c => c.TenantId).IsRequired();
        builder.HasIndex(c => new { c.TenantId, c.Code }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.IsActive, c.FiscalYear });
    }
}
