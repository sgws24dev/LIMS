using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Infrastructure.Persistence.EntityConfigurations;

public class StockTransactionConfiguration : IEntityTypeConfiguration<StockTransaction>
{
    public void Configure(EntityTypeBuilder<StockTransaction> builder)
    {
        builder.ToTable("StockTransactions");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.ReferenceType).HasMaxLength(100);
        builder.Property(t => t.TransactedByName).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Notes).HasMaxLength(1000);
        builder.Property(t => t.Quantity).HasPrecision(14, 4);
        builder.Property(t => t.QuantityBefore).HasPrecision(14, 4);
        builder.Property(t => t.QuantityAfter).HasPrecision(14, 4);
        builder.Property(t => t.UnitCost).HasPrecision(18, 4);
        builder.Property(t => t.TotalCost).HasPrecision(18, 4);
        builder.Property(t => t.TenantId).IsRequired();
        builder.HasIndex(t => new { t.TenantId, t.InventoryItemId, t.TransactedAt });
        builder.HasIndex(t => new { t.TenantId, t.ReferenceType, t.ReferenceId });
        builder.HasOne(t => t.InventoryItem)
            .WithMany(i => i.StockTransactions)
            .HasForeignKey(t => t.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
