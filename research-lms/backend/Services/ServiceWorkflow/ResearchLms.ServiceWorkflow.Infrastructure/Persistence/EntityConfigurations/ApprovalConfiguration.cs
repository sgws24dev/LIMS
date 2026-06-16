using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class ApprovalConfiguration : IEntityTypeConfiguration<Approval>
{
    public void Configure(EntityTypeBuilder<Approval> builder)
    {
        builder.ToTable("Approvals");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.ApproverUserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ApproverName).HasMaxLength(200);
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.Comment).HasMaxLength(2000);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.ServiceRequestId, e.StepOrder }).IsUnique();
        builder.HasIndex(e => new { e.ApproverUserId, e.Status });
    }
}
