using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Description).HasMaxLength(500);

        builder.HasMany(r => r.Permissions)
            .WithOne()
            .HasForeignKey("RoleId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(r => r.Permissions)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
