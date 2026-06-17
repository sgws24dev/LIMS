namespace ResearchLms.Inventory.Domain.ValueObjects;

public record StockLevel(
    decimal OnHand,
    decimal Reserved,
    decimal Available,
    bool IsLowStock,
    bool IsOutOfStock,
    bool IsExpiringSoon,
    bool IsExpired
);
