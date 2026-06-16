using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence.EntityConfigurations;

public class RequestStatusHistoryConfiguration : IEntityTypeConfiguration<RequestStatusHistory>
{
    public void Configure(EntityTypeBuilder<RequestStatusHistory> builder)
    {
        builder.ToTable("RequestStatusHistory");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.FromStatus).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.ToStatus).HasMaxLength(50).IsRequired()
            .HasConversion<string>();
        builder.Property(e => e.Comment).HasMaxLength(2000);
        builder.Property(e => e.ChangedBy).HasMaxLength(100).IsRequired();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => e.ServiceRequestId);
    }
}
