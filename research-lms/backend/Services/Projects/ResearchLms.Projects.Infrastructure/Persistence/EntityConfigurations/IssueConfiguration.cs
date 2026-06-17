using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Projects.Domain.Entities;

namespace ResearchLms.Projects.Infrastructure.Persistence.EntityConfigurations;

public class IssueConfiguration : IEntityTypeConfiguration<Issue>
{
    public void Configure(EntityTypeBuilder<Issue> builder)
    {
        builder.ToTable("Issues");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Title).IsRequired().HasMaxLength(300);
        builder.Property(i => i.Description).HasColumnType("nvarchar(max)");
        builder.Property(i => i.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(i => i.Severity).HasConversion<string>().HasMaxLength(50);
        builder.Property(i => i.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(i => i.Priority).HasConversion<string>().HasMaxLength(50);
        builder.Property(i => i.AssignedToName).HasMaxLength(200);
        builder.Property(i => i.ReportedByName).IsRequired().HasMaxLength(200);
        builder.Property(i => i.ExternalId).HasMaxLength(200);
        builder.Property(i => i.ExternalUrl).HasMaxLength(1000);
        builder.Property(i => i.ExternalProvider).HasMaxLength(50);
        builder.Property(i => i.Tags).HasMaxLength(500);
        builder.Property(i => i.TenantId).IsRequired();
        builder.HasIndex(i => new { i.TenantId, i.Status, i.Severity });
        builder.HasIndex(i => i.AssignedToId);
        builder.HasIndex(i => new { i.TenantId, i.ExternalId, i.ExternalProvider });
        builder.HasOne(i => i.Project)
            .WithMany()
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(i => i.WorkOrder)
            .WithMany(w => w.Issues)
            .HasForeignKey(i => i.WorkOrderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
