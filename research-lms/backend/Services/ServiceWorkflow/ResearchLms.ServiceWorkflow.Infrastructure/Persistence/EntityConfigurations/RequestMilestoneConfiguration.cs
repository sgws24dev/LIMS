using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class RequestMilestoneConfiguration : IEntityTypeConfiguration<RequestMilestone>
{
    public void Configure(EntityTypeBuilder<RequestMilestone> builder)
    {
        builder.ToTable("RequestMilestones");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Order).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.CompletedBy).HasMaxLength(100);
        builder.Property(e => e.AssignedTo).HasMaxLength(100);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.ServiceRequestId, e.Order });
    }
}
