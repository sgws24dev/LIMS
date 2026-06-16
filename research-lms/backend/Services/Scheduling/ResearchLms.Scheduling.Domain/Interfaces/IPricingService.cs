using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IPricingService
{
    CostBreakdown Calculate(
        decimal hourlyRate,
        DateTime startTime,
        DateTime endTime,
        bool isRecurring = false,
        int? recurringInstanceCount = null);

    Task<CostBreakdown> CalculateForBookingAsync(Guid bookingId, CancellationToken ct);
}
