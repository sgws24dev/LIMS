using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class WorkflowDefinitionConfiguration : IEntityTypeConfiguration<WorkflowDefinition>
{
    public void Configure(EntityTypeBuilder<WorkflowDefinition> builder)
    {
        builder.ToTable("WorkflowDefinitions");
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name).IsRequired().HasMaxLength(300);
        builder.Property(w => w.Description).HasMaxLength(1000);
        builder.Property(w => w.States).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(w => w.Transitions).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(w => w.EntityTypeHint).HasMaxLength(100);

        builder.Property(w => w.TenantId).IsRequired();
        builder.Property(w => w.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(w => w.UpdatedBy).HasMaxLength(100);
        builder.Property(w => w.DeletedBy).HasMaxLength(100);

        builder.HasIndex(w => new { w.TenantId, w.IsPublished, w.IsDeleted });
    }
}
