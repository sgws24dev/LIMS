using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.DTOs;

public record PurchaseOrderDto(
    Guid Id,
    string PONumber,
    Guid VendorId,
    string VendorName,
    string Status,
    DateTime OrderedAt,
    DateTime? ExpectedDeliveryDate,
    decimal Subtotal,
    decimal Tax,
    decimal TotalAmount,
    int ItemCount,
    string? Notes,
    DateTime CreatedAt
);

public record PurchaseOrderDetailDto(
    Guid Id,
    string PONumber,
    Guid VendorId,
    string VendorName,
    string Status,
    DateTime OrderedAt,
    DateTime? ExpectedDeliveryDate,
    DateTime? ReceivedAt,
    string? CostCenterId,
    string? ShippingAddress,
    string? Notes,
    Guid? RequestedById,
    string? RequestedByName,
    Guid? ApprovedById,
    string? ApprovedByName,
    DateTime? ApprovedAt,
    decimal Subtotal,
    decimal Tax,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IEnumerable<PurchaseOrderLineDto> Lines
);

public record PurchaseOrderLineDto(
    Guid Id,
    Guid InventoryItemId,
    string ItemName,
    string ItemSku,
    string? Description,
    decimal QuantityOrdered,
    decimal QuantityReceived,
    decimal QuantityPending,
    decimal UnitPrice,
    decimal TotalPrice,
    bool IsFullyReceived,
    string? Notes
);

public record StockTransactionDto(
    Guid Id,
    string Type,
    decimal Quantity,
    decimal QuantityBefore,
    decimal QuantityAfter,
    decimal UnitCost,
    decimal TotalCost,
    string? ReferenceType,
    Guid? ReferenceId,
    string? Notes,
    string? TransactedByName,
    DateTime TransactedAt
);

public record LowStockAlertDto(
    Guid ItemId,
    string SKU,
    string Name,
    string Category,
    decimal QuantityOnHand,
    decimal ReorderPoint,
    decimal ReorderQuantity,
    string? StorageLocation,
    string? PreferredVendorName
);

public record ExpiringItemDto(
    Guid ItemId,
    string SKU,
    string Name,
    string Category,
    decimal QuantityOnHand,
    DateOnly ExpiryDate,
    int DaysUntilExpiry,
    bool IsHazardous,
    string? StorageLocation
);

public record InventoryDashboardStatsDto(
    int TotalActiveItems,
    int LowStockCount,
    int OutOfStockCount,
    int ExpiringCount,
    int ExpiredCount,
    decimal TotalInventoryValue,
    int PendingPurchaseOrders,
    decimal PendingPOValue
);

public record StockMovementSummaryDto(
    Guid ItemId,
    string ItemName,
    decimal TotalReceived,
    decimal TotalIssued,
    decimal TotalAdjusted,
    decimal NetChange,
    decimal OpeningBalance,
    decimal ClosingBalance
);
