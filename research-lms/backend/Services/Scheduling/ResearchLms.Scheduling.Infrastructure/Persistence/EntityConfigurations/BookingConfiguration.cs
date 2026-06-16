using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.EntityConfigurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Title).HasMaxLength(200).IsRequired();
        builder.Property(b => b.UserName).HasMaxLength(100).IsRequired();
        builder.Property(b => b.Purpose).HasMaxLength(500);
        builder.Property(b => b.Notes).HasMaxLength(2000);
        builder.Property(b => b.CancellationReason).HasMaxLength(500);

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(b => b.ResourceType)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(b => b.Cost)
            .HasColumnType("decimal(18,2)");

        builder.HasIndex(b => new { b.ResourceId, b.StartTime, b.EndTime });

        builder.HasOne(b => b.BookingResource)
            .WithMany()
            .HasForeignKey(b => b.ResourceId)
            .HasPrincipalKey(r => r.ResourceId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(b => b.RecurringRule)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RecurringRuleId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
