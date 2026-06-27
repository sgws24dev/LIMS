using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Communications.Domain.Entities;

namespace ResearchLms.Communications.Infrastructure.Persistence.EntityConfigurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("NotificationPreferences");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.NotificationType).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ChannelsJson).HasColumnName("Channels").HasMaxLength(1000).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.UserId, x.NotificationType }).IsUnique();
    }
}
