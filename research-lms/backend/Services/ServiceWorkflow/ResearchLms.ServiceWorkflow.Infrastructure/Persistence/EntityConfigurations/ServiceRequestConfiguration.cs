using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> builder)
    {
        builder.ToTable("ServiceRequests");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.FormData).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(e => e.ApprovalRouting).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.AssignedTo).HasMaxLength(100);
        builder.Property(e => e.SubmittedBy).HasMaxLength(100);
        builder.Property(e => e.CompletedBy).HasMaxLength(100);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasOne(e => e.FormDefinition)
            .WithMany()
            .HasForeignKey(e => e.FormDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ParentRequest)
            .WithMany()
            .HasForeignKey(e => e.ParentRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Milestones)
            .WithOne(e => e.ServiceRequest)
            .HasForeignKey(e => e.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Approvals)
            .WithOne(e => e.ServiceRequest)
            .HasForeignKey(e => e.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.StatusHistory)
            .WithOne(e => e.ServiceRequest)
            .HasForeignKey(e => e.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.AssignedTo });
        builder.HasIndex(e => e.FormDefinitionId);
    }
}
