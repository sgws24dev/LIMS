using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class NotificationRuleConfiguration : IEntityTypeConfiguration<NotificationRule>
{
    public void Configure(EntityTypeBuilder<NotificationRule> builder)
    {
        builder.ToTable("NotificationRules");
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Trigger).IsRequired().HasMaxLength(100);
        builder.Property(n => n.Channel).HasConversion<string>().HasMaxLength(50);
        builder.Property(n => n.Subject).IsRequired().HasMaxLength(500);
        builder.Property(n => n.Body).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(n => n.Recipients).IsRequired().HasColumnType("nvarchar(max)");

        builder.Property(n => n.TenantId).IsRequired();
        builder.Property(n => n.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(n => n.UpdatedBy).HasMaxLength(100);
        builder.Property(n => n.DeletedBy).HasMaxLength(100);

        builder.HasIndex(n => new { n.TenantId, n.WorkflowDefinitionId, n.Trigger });
        builder.HasOne<WorkflowDefinition>()
            .WithMany()
            .HasForeignKey(n => n.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
