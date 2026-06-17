using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.DTOs;

public record VendorDto(
    Guid Id,
    string Code,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Website,
    string Status,
    string PaymentTerms,
    int LeadTimeDays,
    bool IsActive,
    int TotalOrdersCount,
    decimal TotalOrdersValue,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record VendorDetailDto(
    Guid Id,
    string Code,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    VendorAddressDto? Address,
    string? Website,
    string Status,
    string PaymentTerms,
    int LeadTimeDays,
    string? TaxId,
    string? Notes,
    int? Rating,
    int TotalOrdersCount,
    decimal TotalOrdersValue,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IEnumerable<PurchaseOrderSummaryDto> RecentOrders
);

public record VendorAddressDto(
    string? Street,
    string? City,
    string? State,
    string? Zip,
    string? Country
);

public record VendorPerformanceSummaryDto(
    Guid VendorId,
    string VendorName,
    int TotalOrders,
    decimal TotalOrderValue,
    decimal AverageOrderValue,
    int OnTimeDeliveries,
    int LateDeliveries,
    decimal OnTimeDeliveryRate,
    int TotalItemsSupplied
);

public record PurchaseOrderSummaryDto(
    Guid Id,
    string PONumber,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt
);
