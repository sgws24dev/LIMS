using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class DashboardDefinitionConfiguration : IEntityTypeConfiguration<DashboardDefinition>
{
    public void Configure(EntityTypeBuilder<DashboardDefinition> builder)
    {
        builder.ToTable("DashboardDefinitions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(1000);
        builder.Property(e => e.Layout).IsRequired();
        builder.Property(e => e.SharedWith);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.Name });
        builder.HasIndex(e => new { e.TenantId, e.IsDefault });

        builder.HasMany(e => e.Widgets)
            .WithOne(e => e.Dashboard)
            .HasForeignKey(e => e.DashboardId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
