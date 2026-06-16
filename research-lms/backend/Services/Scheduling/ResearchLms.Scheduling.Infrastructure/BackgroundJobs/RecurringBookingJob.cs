using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.BackgroundJobs;

public class RecurringBookingJob : IRecurringBookingJob
{
    private readonly IRecurringRuleService _ruleService;
    private readonly SchedulingDbContext _context;
    private readonly ILogger<RecurringBookingJob> _logger;

    public RecurringBookingJob(
        IRecurringRuleService ruleService,
        SchedulingDbContext context,
        ILogger<RecurringBookingJob> logger)
    {
        _ruleService = ruleService;
        _context = context;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var horizon = today.AddDays(90);

        var activeRules = await _context.RecurringRules
            .Where(r => r.Status == RecurringRuleStatus.Active
                     && (r.EffectiveTo == null || r.EffectiveTo >= today))
            .ToListAsync();

        foreach (var rule in activeRules)
        {
            try
            {
                var count = await _ruleService.GenerateInstancesAsync(rule, horizon, CancellationToken.None);
                if (count > 0)
                    _logger.LogInformation(
                        "Generated {Count} booking instances for RecurringRule {RuleId}",
                        count, rule.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to generate instances for RecurringRule {RuleId}", rule.Id);
            }
        }
    }
}
