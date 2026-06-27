using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Communications.Domain.Entities;

namespace ResearchLms.Communications.Infrastructure.Persistence.EntityConfigurations;

public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    public void Configure(EntityTypeBuilder<Announcement> builder)
    {
        builder.ToTable("Announcements");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Body).IsRequired();
        builder.Property(x => x.Priority).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(x => x.TargetAudience).HasMaxLength(200);
        builder.HasIndex(x => new { x.TenantId, x.ValidFrom, x.ValidTo });
    }
}
