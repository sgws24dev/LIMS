using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Infrastructure.Persistence.EntityConfigurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("Vendors");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Code).IsRequired().HasMaxLength(50);
        builder.Property(v => v.Name).IsRequired().HasMaxLength(300);
        builder.Property(v => v.ContactPerson).HasMaxLength(200);
        builder.Property(v => v.Email).HasMaxLength(300);
        builder.Property(v => v.Phone).HasMaxLength(50);
        builder.Property(v => v.Address).HasColumnType("nvarchar(max)");
        builder.Property(v => v.Website).HasMaxLength(500);
        builder.Property(v => v.TaxId).HasMaxLength(50);
        builder.Property(v => v.Notes).HasMaxLength(2000);
        builder.Property(v => v.LeadTimeDays).HasDefaultValue(0);
        builder.Property(v => v.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(v => v.PaymentTerms).HasConversion<string>().HasMaxLength(50);
        builder.Property(v => v.TotalOrdersValue).HasPrecision(18, 2);
        builder.Property(v => v.TenantId).IsRequired();
        builder.HasIndex(v => new { v.TenantId, v.Code }).IsUnique();
        builder.HasIndex(v => new { v.TenantId, v.Status });
        builder.HasMany(v => v.PurchaseOrders)
            .WithOne(p => p.Vendor)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
