using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Infrastructure.Persistence.EntityConfigurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PONumber).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.ShippingAddress).HasMaxLength(1000);
        builder.Property(p => p.Notes).HasMaxLength(2000);
        builder.Property(p => p.RequestedByName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.ApprovedByName).HasMaxLength(200);
        builder.Property(p => p.Subtotal).HasPrecision(18, 2);
        builder.Property(p => p.Tax).HasPrecision(18, 2);
        builder.Property(p => p.TotalAmount).HasPrecision(18, 2);
        builder.Property(p => p.TenantId).IsRequired();
        builder.HasIndex(p => new { p.TenantId, p.PONumber }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => p.VendorId);
        builder.HasOne(p => p.Vendor)
            .WithMany(v => v.PurchaseOrders)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(p => p.Lines)
            .WithOne(l => l.PurchaseOrder)
            .HasForeignKey(l => l.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
