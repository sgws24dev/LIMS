using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Training.Domain.Entities;

namespace ResearchLms.Training.Infrastructure.Persistence.EntityConfigurations;

public class PrerequisiteRuleConfiguration : IEntityTypeConfiguration<PrerequisiteRule>
{
    public void Configure(EntityTypeBuilder<PrerequisiteRule> builder)
    {
        builder.ToTable("PrerequisiteRules");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.InstrumentId);
        builder.Property(e => e.CompetencyId).IsRequired();

        builder.HasOne(e => e.Competency)
            .WithMany()
            .HasForeignKey(e => e.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.TenantId, e.InstrumentId });
    }
}
