using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class ReportDefinitionConfiguration : IEntityTypeConfiguration<ReportDefinition>
{
    public void Configure(EntityTypeBuilder<ReportDefinition> builder)
    {
        builder.ToTable("ReportDefinitions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.SourceEntity)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.FieldsJson)
            .HasColumnName("Fields")
            .IsRequired();

        builder.Property(e => e.FiltersJson)
            .HasColumnName("Filters")
            .IsRequired();

        builder.Property(e => e.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.HasIndex(e => new { e.TenantId, e.Name });
    }
}
