using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Infrastructure.Persistence.EntityConfigurations;

public class WorkOrderConfiguration : IEntityTypeConfiguration<WorkOrder>
{
    public void Configure(EntityTypeBuilder<WorkOrder> builder)
    {
        builder.ToTable("WorkOrders");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Title).IsRequired().HasMaxLength(300);
        builder.Property(w => w.Description).HasMaxLength(2000);
        builder.Property(w => w.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(w => w.Priority).HasConversion<string>().HasMaxLength(50);
        builder.Property(w => w.AssignedToName).HasMaxLength(200);
        builder.Property(w => w.EstimatedHours).HasPrecision(10, 2);
        builder.Property(w => w.ActualHours).HasPrecision(10, 2);
        builder.Property(w => w.BilledAmount).HasPrecision(18, 2);
        builder.Property(w => w.Tags).HasMaxLength(500);
        builder.Property(w => w.TenantId).IsRequired();
        builder.HasIndex(w => new { w.TenantId, w.Status });
        builder.HasIndex(w => w.AssignedToId);
        builder.HasIndex(w => new { w.ProjectId, w.Status });
    }
}
