using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("Permissions");

        builder.Property(p => p.Module).IsRequired().HasMaxLength(100);

        builder.HasIndex(p => p.Module);
    }
}
