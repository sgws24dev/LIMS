using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class PricingService : IPricingService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IBookingResourceRepository _resourceRepo;
    private readonly IRecurringRuleRepository _recurringRuleRepo;

    public PricingService(
        IBookingRepository bookingRepo,
        IBookingResourceRepository resourceRepo,
        IRecurringRuleRepository recurringRuleRepo)
    {
        _bookingRepo = bookingRepo;
        _resourceRepo = resourceRepo;
        _recurringRuleRepo = recurringRuleRepo;
    }

    public CostBreakdown Calculate(decimal hourlyRate, DateTime start, DateTime end,
        bool isRecurring = false, int? recurringInstanceCount = null)
    {
        var durationHours = (end - start).TotalHours;
        var baseAmount = hourlyRate * (decimal)durationHours;

        decimal discountPct = 0;
        string? discountReason = null;

        if (isRecurring && recurringInstanceCount >= 10)
        {
            discountPct = 0.10m;
            discountReason = "10% recurring booking discount";
        }
        else if (durationHours >= 8)
        {
            discountPct = 0.15m;
            discountReason = "15% full-day booking discount";
        }
        else if (durationHours >= 4)
        {
            discountPct = 0.05m;
            discountReason = "5% half-day booking discount";
        }

        var discount = baseAmount * discountPct;
        var totalAmount = baseAmount - discount;

        return new CostBreakdown(hourlyRate, durationHours, baseAmount, discount, totalAmount, discountReason);
    }

    public async Task<CostBreakdown> CalculateForBookingAsync(Guid bookingId, CancellationToken ct)
    {
        var booking = await _bookingRepo.GetByIdAsync(bookingId, ct);
        if (booking is null)
            return new CostBreakdown(0, 0, 0, 0, 0, null);

        var resource = await _resourceRepo.GetByResourceIdAsync(booking.ResourceId, ct);
        var hourlyRate = resource?.HourlyRate ?? 0;

        int? instanceCount = null;
        if (booking.RecurringRuleId.HasValue)
        {
            var rule = await _recurringRuleRepo.GetByIdAsync(booking.RecurringRuleId.Value, ct);
            instanceCount = rule?.GeneratedCount;
        }

        return Calculate(hourlyRate, booking.StartTime, booking.EndTime,
            booking.RecurringRuleId.HasValue, instanceCount);
    }
}
