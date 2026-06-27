using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Infrastructure.Persistence.EntityConfigurations;

public class UserCompetencyConfiguration : IEntityTypeConfiguration<UserCompetency>
{
    public void Configure(EntityTypeBuilder<UserCompetency> builder)
    {
        builder.ToTable("UserCompetencies");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.UserId).IsRequired();
        builder.Property(e => e.CompetencyId).IsRequired();
        builder.Property(e => e.AchievedAt).IsRequired();
        builder.Property(e => e.ExpiresAt);
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(e => e.RenewedAt);

        builder.HasOne(e => e.Competency)
            .WithMany()
            .HasForeignKey(e => e.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasIndex(e => new { e.TenantId, e.UserId });
        builder.HasIndex(e => new { e.TenantId, e.CompetencyId });
        builder.HasIndex(e => new { e.TenantId, e.Status });
    }
}
