using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class WorkOrderConfiguration : IEntityTypeConfiguration<WorkOrder>
{
    public void Configure(EntityTypeBuilder<WorkOrder> builder)
    {
        builder.ToTable("WorkOrders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.MaintenanceRecordId).IsRequired();
        builder.Property(x => x.Title).IsRequired().HasMaxLength(300);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.AssigneeName).HasMaxLength(200);
        builder.Property(x => x.ResolutionNotes).HasMaxLength(2000);
        builder.Property(x => x.Priority).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();

        builder.HasOne(x => x.MaintenanceRecord)
            .WithMany(x => x.WorkOrders)
            .HasForeignKey(x => x.MaintenanceRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.TenantId, x.MaintenanceRecordId });
        builder.HasIndex(x => new { x.TenantId, x.Status, x.Priority });
    }
}
