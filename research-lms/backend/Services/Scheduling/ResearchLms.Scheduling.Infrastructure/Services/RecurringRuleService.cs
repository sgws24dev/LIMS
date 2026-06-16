using Microsoft.Extensions.Logging;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Domain.ValueObjects;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class RecurringRuleService : IRecurringRuleService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IRecurringRuleRepository _recurringRuleRepo;
    private readonly IAvailabilityService _availabilityService;
    private readonly ILogger<RecurringRuleService> _logger;

    public RecurringRuleService(
        IBookingRepository bookingRepo,
        IRecurringRuleRepository recurringRuleRepo,
        IAvailabilityService availabilityService,
        ILogger<RecurringRuleService> logger)
    {
        _bookingRepo = bookingRepo;
        _recurringRuleRepo = recurringRuleRepo;
        _availabilityService = availabilityService;
        _logger = logger;
    }

    public IEnumerable<DateTime> PreviewInstances(RecurringRule rule, int count = 10)
    {
        var results = new List<DateTime>();
        var current = rule.EffectiveFrom;
        var limit = rule.EffectiveTo ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(365));

        while (results.Count < count && current <= limit
               && results.Count < (rule.MaxInstances ?? int.MaxValue))
        {
            if (IsOccurrenceDate(rule, current))
            {
                var dt = current.ToDateTime(rule.TimeOfDay, DateTimeKind.Utc);
                results.Add(dt);
            }
            current = Advance(rule.Frequency, current);
        }
        return results;
    }

    public async Task<int> GenerateInstancesAsync(
        RecurringRule rule, DateOnly horizonDate, CancellationToken ct)
    {
        var startFrom = rule.LastGeneratedDate.HasValue
            ? rule.LastGeneratedDate.Value.AddDays(1)
            : rule.EffectiveFrom;

        var toGenerate = GetOccurrenceDates(rule, startFrom, horizonDate);
        int generated = 0;

        foreach (var occurrenceDate in toGenerate)
        {
            if (rule.MaxInstances.HasValue
                && rule.GeneratedCount + generated >= rule.MaxInstances.Value)
                break;

            var start = occurrenceDate.ToDateTime(rule.TimeOfDay, DateTimeKind.Utc);
            var end = start.AddMinutes(rule.DurationMinutes);

            bool hasConflict = await _bookingRepo.HasOverlapAsync(
                rule.ResourceId, start, end, null, ct);
            if (hasConflict) continue;

            var booking = new Booking(
                rule.ResourceId, rule.ResourceType,
                rule.UserId, rule.UserName,
                rule.Title, start, end,
                rule.Purpose, rule.Notes,
                rule.Id, rule.TenantId);

            await _bookingRepo.AddAsync(booking, ct);
            generated++;
        }

        rule.LastGeneratedDate = horizonDate;
        rule.GeneratedCount += generated;

        if (rule.EffectiveTo.HasValue && horizonDate >= rule.EffectiveTo.Value)
            rule.Status = RecurringRuleStatus.Completed;

        await _recurringRuleRepo.UpdateAsync(rule, ct);
        return generated;
    }

    public async Task CancelFutureInstancesAsync(Guid ruleId, CancellationToken ct)
    {
        var rule = await _recurringRuleRepo.GetByIdAsync(ruleId, ct);
        if (rule is null) return;

        var future = await _recurringRuleRepo.GetFutureInstancesAsync(ruleId, ct);
        var affectedDates = new HashSet<DateOnly>();

        foreach (var booking in future)
        {
            booking.Cancel("Recurring rule cancelled");
            await _bookingRepo.UpdateAsync(booking, ct);
            affectedDates.Add(DateOnly.FromDateTime(booking.StartTime));
        }

        rule.Status = RecurringRuleStatus.Cancelled;
        await _recurringRuleRepo.UpdateAsync(rule, ct);

        foreach (var date in affectedDates)
            await _availabilityService.InvalidateCacheAsync(rule.ResourceId, date);
    }

    private List<DateOnly> GetOccurrenceDates(RecurringRule rule, DateOnly from, DateOnly to)
    {
        var dates = new List<DateOnly>();
        var current = from;
        var limit = rule.EffectiveTo.HasValue && rule.EffectiveTo.Value < to
            ? rule.EffectiveTo.Value : to;

        while (current <= limit)
        {
            if (IsOccurrenceDate(rule, current))
                dates.Add(current);
            current = Advance(rule.Frequency, current);
        }
        return dates;
    }

    private bool IsOccurrenceDate(RecurringRule rule, DateOnly date) =>
        rule.Frequency switch
        {
            RecurringFrequency.Daily => true,
            RecurringFrequency.Weekly => IsDayInMask(rule.DayOfWeekMask, date.DayOfWeek),
            RecurringFrequency.BiWeekly => IsDayInMask(rule.DayOfWeekMask, date.DayOfWeek)
                                           && IsEvenWeek(date),
            RecurringFrequency.Monthly => date.Day == rule.EffectiveFrom.Day,
            RecurringFrequency.Custom => IsDayInMask(rule.DayOfWeekMask, date.DayOfWeek),
            _ => false
        };

    private static bool IsDayInMask(int mask, DayOfWeek day) =>
        (mask & (1 << (int)day)) != 0;

    private static bool IsEvenWeek(DateOnly date) =>
        System.Globalization.ISOWeek.GetWeekOfYear(date.ToDateTime(TimeOnly.MinValue)) % 2 == 0;

    private static DateOnly Advance(RecurringFrequency freq, DateOnly current) =>
        freq switch
        {
            RecurringFrequency.Monthly => current.AddMonths(1),
            _ => current.AddDays(1)
        };
}
