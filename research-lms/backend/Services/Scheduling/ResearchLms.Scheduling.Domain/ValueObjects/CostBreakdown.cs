namespace ResearchLms.Scheduling.Domain.ValueObjects;

public record CostBreakdown(
    decimal HourlyRate,
    double DurationHours,
    decimal BaseAmount,
    decimal Discount,
    decimal TotalAmount,
    string? DiscountReason
);
