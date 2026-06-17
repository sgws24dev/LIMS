using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Infrastructure.Persistence.EntityConfigurations;

public class InventoryItemConfiguration : IEntityTypeConfiguration<InventoryItem>
{
    public void Configure(EntityTypeBuilder<InventoryItem> builder)
    {
        builder.ToTable("InventoryItems");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.SKU).IsRequired().HasMaxLength(100);
        builder.Property(i => i.Name).IsRequired().HasMaxLength(300);
        builder.Property(i => i.Description).HasMaxLength(2000);
        builder.Property(i => i.Category).HasConversion<string>().HasMaxLength(50);
        builder.Property(i => i.UnitOfMeasure).HasConversion<string>().HasMaxLength(50);
        builder.Property(i => i.QuantityOnHand).HasPrecision(14, 4);
        builder.Property(i => i.QuantityReserved).HasPrecision(14, 4);
        builder.Property(i => i.ReorderPoint).HasPrecision(14, 4);
        builder.Property(i => i.ReorderQuantity).HasPrecision(14, 4);
        builder.Property(i => i.UnitCost).HasPrecision(18, 4);
        builder.Property(i => i.Barcode).HasMaxLength(200);
        builder.Property(i => i.StorageLocation).HasMaxLength(200);
        builder.Property(i => i.TenantId).IsRequired();
        builder.HasIndex(i => new { i.TenantId, i.SKU }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.Barcode }).IsUnique().HasFilter("[Barcode] IS NOT NULL");
        builder.HasIndex(i => new { i.TenantId, i.Category, i.IsActive });
        builder.HasQueryFilter(i => i.IsActive);
        builder.HasMany(i => i.StockTransactions)
            .WithOne(s => s.InventoryItem)
            .HasForeignKey(s => s.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
