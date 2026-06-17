using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Infrastructure.Persistence.EntityConfigurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(300);
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.Priority).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.ProjectManagerName).HasMaxLength(200);
        builder.Property(p => p.Budget).HasPrecision(18, 2);
        builder.Property(p => p.Spent).HasPrecision(18, 2);
        builder.Property(p => p.TenantId).IsRequired();
        builder.HasIndex(p => new { p.TenantId, p.Status, p.IsArchived });
        builder.HasIndex(p => p.ProjectManagerId);
        builder.HasMany(p => p.WorkOrders)
            .WithOne(w => w.Project)
            .HasForeignKey(w => w.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
