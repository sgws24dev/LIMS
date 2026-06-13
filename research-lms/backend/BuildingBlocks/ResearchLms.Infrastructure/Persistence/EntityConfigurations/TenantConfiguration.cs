using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Code).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Domain).HasMaxLength(200);
        builder.Property(t => t.LogoUrl).HasMaxLength(500);
        builder.Property(t => t.SubscriptionPlan).HasMaxLength(100);
        builder.Property(t => t.ContactEmail).HasMaxLength(200);
        builder.Property(t => t.ContactPhone).HasMaxLength(50);
        builder.Property(t => t.Address).HasMaxLength(500);
        builder.Property(t => t.Settings).HasMaxLength(4000);

        builder.HasIndex(t => t.Code).IsUnique();
        builder.HasIndex(t => t.Domain).IsUnique();
    }
}
