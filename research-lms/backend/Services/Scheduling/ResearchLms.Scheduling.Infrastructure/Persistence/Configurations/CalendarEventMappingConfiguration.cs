using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.Configurations;

public class CalendarEventMappingConfiguration : IEntityTypeConfiguration<CalendarEventMapping>
{
    public void Configure(EntityTypeBuilder<CalendarEventMapping> builder)
    {
        builder.ToTable("CalendarEventMappings");

        builder.HasKey(m => new { m.BookingId, m.Provider });

        builder.Property(m => m.BookingId).IsRequired();
        builder.Property(m => m.Provider).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(m => m.ExternalEventId).HasMaxLength(500).IsRequired();
    }
}
