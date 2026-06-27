using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Communications.Domain.Entities;

namespace ResearchLms.Communications.Infrastructure.Persistence.EntityConfigurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Body).IsRequired();
        builder.Property(x => x.Link).HasMaxLength(1000);
        builder.HasIndex(x => new { x.TenantId, x.UserId });
        builder.HasIndex(x => new { x.TenantId, x.UserId, x.IsRead });
    }
}
