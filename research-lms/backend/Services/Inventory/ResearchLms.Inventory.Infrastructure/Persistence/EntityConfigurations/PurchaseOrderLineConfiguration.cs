using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Infrastructure.Persistence.EntityConfigurations;

public class PurchaseOrderLineConfiguration : IEntityTypeConfiguration<PurchaseOrderLine>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLine> builder)
    {
        builder.ToTable("PurchaseOrderLines");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Description).HasMaxLength(500);
        builder.Property(l => l.QuantityOrdered).HasPrecision(14, 4);
        builder.Property(l => l.QuantityReceived).HasPrecision(14, 4);
        builder.Property(l => l.UnitPrice).HasPrecision(18, 4);
        builder.Property(l => l.TotalPrice).HasPrecision(18, 4);
        builder.Property(l => l.Notes).HasMaxLength(500);
        builder.HasIndex(l => l.PurchaseOrderId);
        builder.HasOne(l => l.InventoryItem)
            .WithMany()
            .HasForeignKey(l => l.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
