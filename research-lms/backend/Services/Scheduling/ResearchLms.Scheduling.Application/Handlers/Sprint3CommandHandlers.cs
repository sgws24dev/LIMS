using MediatR;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Commands;

public class CreateRecurringRuleCommandHandler : IRequestHandler<CreateRecurringRuleCommand, Guid>
{
    private readonly IRecurringRuleRepository _ruleRepo;
    private readonly IBookingResourceRepository _resourceRepo;
    private readonly IRecurringRuleService _ruleService;

    public CreateRecurringRuleCommandHandler(
        IRecurringRuleRepository ruleRepo,
        IBookingResourceRepository resourceRepo,
        IRecurringRuleService ruleService)
    {
        _ruleRepo = ruleRepo;
        _resourceRepo = resourceRepo;
        _ruleService = ruleService;
    }

    public async Task<Guid> Handle(CreateRecurringRuleCommand cmd, CancellationToken ct)
    {
        var resource = await _resourceRepo.GetByResourceIdAsync(cmd.ResourceId, ct);
        if (resource is null || !resource.IsActive)
            throw new NotFoundException("Resource not found or is inactive.");

        var rule = new RecurringRule
        {
            TenantId = Guid.Empty, // Will be set by tenant context
            ResourceId = cmd.ResourceId,
            ResourceType = cmd.ResourceType,
            UserId = cmd.UserId,
            UserName = cmd.UserName,
            Title = cmd.Title,
            Purpose = cmd.Purpose,
            Notes = cmd.Notes,
            Frequency = cmd.Frequency,
            DayOfWeekMask = cmd.DayOfWeekMask,
            TimeOfDay = cmd.TimeOfDay,
            DurationMinutes = cmd.DurationMinutes,
            EffectiveFrom = cmd.EffectiveFrom,
            EffectiveTo = cmd.EffectiveTo,
            MaxInstances = cmd.MaxInstances ?? 100,
            Status = RecurringRuleStatus.Active,
        };

        await _ruleRepo.AddAsync(rule, ct);

        var horizon = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(90));
        await _ruleService.GenerateInstancesAsync(rule, horizon, ct);

        return rule.Id;
    }
}

public class UpdateRecurringRuleCommandHandler : IRequestHandler<UpdateRecurringRuleCommand, Unit>
{
    private readonly IRecurringRuleRepository _ruleRepo;
    private readonly IRecurringRuleService _ruleService;

    public UpdateRecurringRuleCommandHandler(
        IRecurringRuleRepository ruleRepo,
        IRecurringRuleService ruleService)
    {
        _ruleRepo = ruleRepo;
        _ruleService = ruleService;
    }

    public async Task<Unit> Handle(UpdateRecurringRuleCommand cmd, CancellationToken ct)
    {
        var rule = await _ruleRepo.GetByIdAsync(cmd.RuleId, ct);
        if (rule is null)
            throw new NotFoundException("Recurring rule not found.");
        if (rule.Status == RecurringRuleStatus.Cancelled)
            throw new InvalidOperationException("Cannot update a cancelled recurring rule.");

        var wasActive = rule.Status == RecurringRuleStatus.Active;

        rule.Title = cmd.Title;
        rule.Purpose = cmd.Purpose;
        rule.DayOfWeekMask = cmd.DayOfWeekMask;
        rule.TimeOfDay = cmd.TimeOfDay;
        rule.DurationMinutes = cmd.DurationMinutes;
        rule.EffectiveTo = cmd.EffectiveTo;
        rule.MaxInstances = cmd.MaxInstances;
        rule.Status = cmd.Status;

        if (wasActive && cmd.Status == RecurringRuleStatus.Cancelled)
            await _ruleService.CancelFutureInstancesAsync(cmd.RuleId, ct);

        await _ruleRepo.UpdateAsync(rule, ct);
        return Unit.Value;
    }
}

public class DeleteRecurringRuleCommandHandler : IRequestHandler<DeleteRecurringRuleCommand, Unit>
{
    private readonly IRecurringRuleRepository _ruleRepo;
    private readonly IRecurringRuleService _ruleService;

    public DeleteRecurringRuleCommandHandler(
        IRecurringRuleRepository ruleRepo,
        IRecurringRuleService ruleService)
    {
        _ruleRepo = ruleRepo;
        _ruleService = ruleService;
    }

    public async Task<Unit> Handle(DeleteRecurringRuleCommand cmd, CancellationToken ct)
    {
        var rule = await _ruleRepo.GetByIdAsync(cmd.RuleId, ct);
        if (rule is null)
            throw new NotFoundException("Recurring rule not found.");

        await _ruleService.CancelFutureInstancesAsync(cmd.RuleId, ct);
        rule.MarkDeleted("System");
        await _ruleRepo.UpdateAsync(rule, ct);

        return Unit.Value;
    }
}
