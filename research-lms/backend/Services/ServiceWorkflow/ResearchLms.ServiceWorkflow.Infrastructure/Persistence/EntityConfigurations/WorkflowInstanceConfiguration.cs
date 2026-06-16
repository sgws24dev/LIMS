using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class WorkflowInstanceConfiguration : IEntityTypeConfiguration<WorkflowInstance>
{
    public void Configure(EntityTypeBuilder<WorkflowInstance> builder)
    {
        builder.ToTable("WorkflowInstances");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(i => i.CurrentState).IsRequired().HasMaxLength(100);
        builder.Property(i => i.StateHistory).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(i => i.ContextData).HasColumnType("nvarchar(max)");
        builder.Property(i => i.Status).HasConversion<string>().HasMaxLength(50);

        builder.Property(i => i.TenantId).IsRequired();
        builder.Property(i => i.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(i => i.UpdatedBy).HasMaxLength(100);
        builder.Property(i => i.DeletedBy).HasMaxLength(100);

        builder.HasIndex(i => new { i.TenantId, i.EntityType, i.EntityId }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.Status });

        builder.HasOne(i => i.WorkflowDefinition)
            .WithMany()
            .HasForeignKey(i => i.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
