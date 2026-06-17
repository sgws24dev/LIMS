using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class FormDefinitionConfiguration : IEntityTypeConfiguration<FormDefinition>
{
    public void Configure(EntityTypeBuilder<FormDefinition> builder)
    {
        builder.ToTable("FormDefinitions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Schema).HasColumnType("nvarchar(max)").IsRequired()
            .HasConversion(v => v.ToString(), v => new Domain.ValueObjects.JsonSchema(v));
        builder.Property(e => e.Fields).HasColumnType("nvarchar(max)");
        builder.Property(e => e.Version).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.Category).HasMaxLength(100).IsRequired();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.Category });
        builder.HasIndex(e => new { e.TenantId, e.Status });
    }
}
