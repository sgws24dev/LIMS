using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Application.Queries;

public static class FrequencyLabelHelper
{
    public static string Build(RecurringFrequency freq, int mask, TimeOnly time, int durationMins)
    {
        var days = Enum.GetValues<DayOfWeek>()
            .Where(d => (mask & (1 << (int)d)) != 0)
            .Select(d => d.ToString());
        return freq switch
        {
            RecurringFrequency.Daily =>
                $"Every day at {time:hh:mm tt} for {durationMins} min",
            RecurringFrequency.Weekly =>
                $"Every {string.Join(", ", days)} at {time:hh:mm tt}",
            RecurringFrequency.BiWeekly =>
                $"Every other {string.Join(", ", days)} at {time:hh:mm tt}",
            RecurringFrequency.Monthly =>
                $"Monthly at {time:hh:mm tt} for {durationMins} min",
            _ => $"Custom schedule at {time:hh:mm tt}"
        };
    }
}

public class GetRecurringRulesQueryHandler : IRequestHandler<GetRecurringRulesQuery, PagedResult<RecurringRuleDto>>
{
    private readonly IRecurringRuleRepository _repo;
    private readonly IBookingResourceRepository _resourceRepo;

    public GetRecurringRulesQueryHandler(
        IRecurringRuleRepository repo,
        IBookingResourceRepository resourceRepo)
    {
        _repo = repo;
        _resourceRepo = resourceRepo;
    }

    public async Task<PagedResult<RecurringRuleDto>> Handle(GetRecurringRulesQuery q, CancellationToken ct)
    {
        var (items, total) = await _repo.GetPagedAsync(q.UserId, q.ResourceId, q.Status, q.Page, q.PageSize, ct);
        var allResources = await _resourceRepo.SearchAsync(null, null, null, ct);
        var resourceMap = allResources.ToDictionary(r => r.ResourceId);

        var dtos = items.Select(r =>
        {
            resourceMap.TryGetValue(r.ResourceId, out var res);
            return new RecurringRuleDto(
                r.Id, r.ResourceId, res?.Name ?? r.ResourceId.ToString(),
                r.ResourceType, r.Title, r.Frequency,
                FrequencyLabelHelper.Build(r.Frequency, r.DayOfWeekMask, r.TimeOfDay, r.DurationMinutes),
                r.TimeOfDay, r.DurationMinutes, r.EffectiveFrom, r.EffectiveTo,
                r.Status, r.GeneratedCount, r.LastGeneratedDate);
        });

        return new PagedResult<RecurringRuleDto>(dtos, total);
    }
}

public class GetRecurringRuleByIdQueryHandler : IRequestHandler<GetRecurringRuleByIdQuery, RecurringRuleDetailDto?>
{
    private readonly IRecurringRuleRepository _repo;
    private readonly IBookingRepository _bookingRepo;
    private readonly IBookingResourceRepository _resourceRepo;
    private readonly IRecurringRuleService _ruleService;

    public GetRecurringRuleByIdQueryHandler(
        IRecurringRuleRepository repo,
        IBookingRepository bookingRepo,
        IBookingResourceRepository resourceRepo,
        IRecurringRuleService ruleService)
    {
        _repo = repo;
        _bookingRepo = bookingRepo;
        _resourceRepo = resourceRepo;
        _ruleService = ruleService;
    }

    public async Task<RecurringRuleDetailDto?> Handle(GetRecurringRuleByIdQuery q, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(q.RuleId, ct);
        if (rule is null) return null;

        var resource = await _resourceRepo.GetByResourceIdAsync(rule.ResourceId, ct);

        var upcoming = rule.Bookings
            .Where(b => b.StartTime > DateTime.UtcNow)
            .OrderBy(b => b.StartTime)
            .Take(5)
            .Select(b => new BookingDto(
                b.Id, b.ResourceId, resource?.Name ?? "", resource?.Identifier ?? "",
                b.ResourceType, b.UserId, b.UserName, b.Title,
                b.StartTime, b.EndTime, b.Status, b.Purpose, b.Notes, b.Cost, b.CreatedAt));

        return new RecurringRuleDetailDto(
            rule.Id, rule.ResourceId, resource?.Name ?? "", rule.ResourceType,
            rule.Title, rule.Purpose, rule.Notes, rule.Frequency,
            FrequencyLabelHelper.Build(rule.Frequency, rule.DayOfWeekMask, rule.TimeOfDay, rule.DurationMinutes),
            rule.DayOfWeekMask, rule.TimeOfDay, rule.DurationMinutes,
            rule.EffectiveFrom, rule.EffectiveTo, rule.MaxInstances,
            rule.Status, rule.GeneratedCount, rule.LastGeneratedDate,
            upcoming);
    }
}

public class GetRecurringPreviewQueryHandler : IRequestHandler<GetRecurringPreviewQuery, IEnumerable<RecurringInstancePreviewDto>>
{
    private readonly IRecurringRuleService _ruleService;
    private readonly IRecurringRuleRepository _repo;
    private readonly IBookingRepository _bookingRepo;

    public GetRecurringPreviewQueryHandler(
        IRecurringRuleService ruleService,
        IRecurringRuleRepository repo,
        IBookingRepository bookingRepo)
    {
        _ruleService = ruleService;
        _repo = repo;
        _bookingRepo = bookingRepo;
    }

    public async Task<IEnumerable<RecurringInstancePreviewDto>> Handle(GetRecurringPreviewQuery q, CancellationToken ct)
    {
        if (q.RuleId.HasValue)
        {
            var existing = await _repo.GetByIdAsync(q.RuleId.Value, ct);
            if (existing is null) return Enumerable.Empty<RecurringInstancePreviewDto>();
            return await PreviewForRule(existing, q.PreviewCount, ct);
        }

        var previewRule = new RecurringRule
        {
            ResourceId = Guid.Empty,
            Frequency = q.Frequency ?? RecurringFrequency.Weekly,
            DayOfWeekMask = q.DayOfWeekMask ?? 62,
            TimeOfDay = q.TimeOfDay ?? new TimeOnly(9, 0),
            DurationMinutes = q.DurationMinutes ?? 60,
            EffectiveFrom = q.EffectiveFrom ?? DateOnly.FromDateTime(DateTime.UtcNow),
            EffectiveTo = q.EffectiveTo,
        };
        return await PreviewForRule(previewRule, q.PreviewCount, ct);
    }

    private async Task<IEnumerable<RecurringInstancePreviewDto>> PreviewForRule(
        RecurringRule rule, int count, CancellationToken ct)
    {

        var previews = _ruleService.PreviewInstances(rule, count > 0 ? count : 10);
        var results = new List<RecurringInstancePreviewDto>();

        foreach (var dt in previews)
        {
            var end = dt.AddMinutes(rule.DurationMinutes);
            var hasConflict = await _bookingRepo.HasOverlapAsync(
                rule.ResourceId, dt, end, null, ct);

            results.Add(new RecurringInstancePreviewDto(dt, end, hasConflict,
                hasConflict ? "Existing booking overlaps with this slot" : null));
        }

        return results;
    }
}

public class GetBookingCostQueryHandler : IRequestHandler<GetBookingCostQuery, CostBreakdownDto>
{
    private readonly IPricingService _pricingService;
    private readonly IBookingResourceRepository _resourceRepo;

    public GetBookingCostQueryHandler(
        IPricingService pricingService,
        IBookingResourceRepository resourceRepo)
    {
        _pricingService = pricingService;
        _resourceRepo = resourceRepo;
    }

    public async Task<CostBreakdownDto> Handle(GetBookingCostQuery q, CancellationToken ct)
    {
        var resource = await _resourceRepo.GetByResourceIdAsync(q.ResourceId, ct);
        var hourlyRate = resource?.HourlyRate ?? 0;
        var cost = _pricingService.Calculate(hourlyRate, q.StartTime, q.EndTime,
            q.IsRecurring, q.RecurringInstanceCount);

        var duration = q.EndTime - q.StartTime;
        var hours = (int)duration.TotalHours;
        var mins = duration.Minutes;

        return new CostBreakdownDto(
            cost.HourlyRate,
            cost.DurationHours,
            hours > 0
                ? $"{hours} hour{(hours != 1 ? "s" : "")} {mins} minute{(mins != 1 ? "s" : "")}"
                : $"{mins} minute{(mins != 1 ? "s" : "")}",
            cost.BaseAmount,
            cost.Discount,
            cost.TotalAmount,
            cost.DiscountReason,
            "\u20B9");
    }
}
