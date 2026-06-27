using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Infrastructure.Persistence.EntityConfigurations;

public class CompetencyConfiguration : IEntityTypeConfiguration<Competency>
{
    public void Configure(EntityTypeBuilder<Competency> builder)
    {
        builder.ToTable("Competencies");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.Property(e => e.Category)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(e => e.ValidityPeriodDays).IsRequired();
        builder.Property(e => e.RequiresRenewal).IsRequired();

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => new { e.TenantId, e.Category });
    }
}
