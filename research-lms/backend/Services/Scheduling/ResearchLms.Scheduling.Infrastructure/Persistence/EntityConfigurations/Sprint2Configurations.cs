using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.EntityConfigurations;

public class ResourceOperatingHoursConfiguration : IEntityTypeConfiguration<ResourceOperatingHours>
{
    public void Configure(EntityTypeBuilder<ResourceOperatingHours> builder)
    {
        builder.ToTable("ResourceOperatingHours");
        builder.HasKey(h => h.ResourceId);
        builder.Property(h => h.Timezone).HasMaxLength(50).HasDefaultValue("UTC");
    }
}

public class MaintenanceWindowConfiguration : IEntityTypeConfiguration<MaintenanceWindow>
{
    public void Configure(EntityTypeBuilder<MaintenanceWindow> builder)
    {
        builder.ToTable("MaintenanceWindows");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Reason).HasMaxLength(500);
        builder.Property(m => m.Source).HasMaxLength(50).IsRequired();
        builder.HasIndex(m => new { m.ResourceId, m.StartTime, m.EndTime });
    }
}

public class ConstraintConfiguration : IEntityTypeConfiguration<Constraint>
{
    public void Configure(EntityTypeBuilder<Constraint> builder)
    {
        builder.ToTable("Constraints");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Value).HasMaxLength(500).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(1000);
        builder.Property(c => c.ErrorMessage).HasMaxLength(500);
        builder.Property(c => c.Type).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(c => c.ResourceType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.HasIndex(c => new { c.TenantId, c.ResourceId, c.IsActive });
    }
}

public class WaitlistEntryConfiguration : IEntityTypeConfiguration<WaitlistEntry>
{
    public void Configure(EntityTypeBuilder<WaitlistEntry> builder)
    {
        builder.ToTable("WaitlistEntries");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.UserName).HasMaxLength(200).IsRequired();
        builder.Property(w => w.Notes).HasMaxLength(500);
        builder.Property(w => w.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.HasIndex(w => new { w.TenantId, w.ResourceId, w.RequestedDate, w.Status });
        builder.HasIndex(w => new { w.TenantId, w.UserId, w.Status });
    }
}

public class UserCompetencyCacheConfiguration : IEntityTypeConfiguration<UserCompetencyCache>
{
    public void Configure(EntityTypeBuilder<UserCompetencyCache> builder)
    {
        builder.ToTable("UserCompetencyCache");
        builder.HasKey(c => new { c.UserId, c.CompetencyCode });
        builder.Property(c => c.CompetencyCode).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Source).HasMaxLength(50).IsRequired();
    }
}

public class ConsumableStockCacheConfiguration : IEntityTypeConfiguration<ConsumableStockCache>
{
    public void Configure(EntityTypeBuilder<ConsumableStockCache> builder)
    {
        builder.ToTable("ConsumableStockCache");
        builder.HasKey(s => s.ItemId);
        builder.Property(s => s.Sku).HasMaxLength(100).IsRequired();
        builder.HasIndex(s => s.Sku);
    }
}
