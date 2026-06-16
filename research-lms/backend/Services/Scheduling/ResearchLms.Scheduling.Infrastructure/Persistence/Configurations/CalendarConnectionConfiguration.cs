using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.Configurations;

public class CalendarConnectionConfiguration : IEntityTypeConfiguration<CalendarConnection>
{
    public void Configure(EntityTypeBuilder<CalendarConnection> builder)
    {
        builder.ToTable("CalendarConnections");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId).IsRequired();
        builder.Property(c => c.UserId).IsRequired();
        builder.Property(c => c.Provider).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(c => c.AccessToken).HasMaxLength(4000).IsRequired();
        builder.Property(c => c.RefreshToken).HasMaxLength(4000).IsRequired();
        builder.Property(c => c.TokenExpiresAt).IsRequired();
        builder.Property(c => c.ExternalCalendarId).HasMaxLength(500);
        builder.Property(c => c.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(c => c.LastSyncAt);
        builder.Property(c => c.SyncDirection).HasConversion<string>().HasMaxLength(30).IsRequired();

        builder.HasIndex(c => new { c.TenantId, c.UserId, c.Provider }).IsUnique();
    }
}
