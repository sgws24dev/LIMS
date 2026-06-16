using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class ConstraintEvaluationService : IConstraintEvaluationService
{
    private readonly IConstraintRepository _constraintRepo;
    private readonly Persistence.SchedulingDbContext _db;
    private readonly ITrainerSyncService _trainerSync;
    private readonly ILogger<ConstraintEvaluationService> _logger;

    public ConstraintEvaluationService(
        IConstraintRepository constraintRepo,
        Persistence.SchedulingDbContext db,
        ITrainerSyncService trainerSync,
        ILogger<ConstraintEvaluationService> logger)
    {
        _constraintRepo = constraintRepo;
        _db = db;
        _trainerSync = trainerSync;
        _logger = logger;
    }

    public async Task<ConstraintEvaluationResult> EvaluateAsync(
        Guid resourceId, Guid userId, TimeSlot slot, CancellationToken ct)
    {
        var constraints = await _constraintRepo.GetActiveByResourceAsync(resourceId, ct);
        var violations = new List<ConstraintViolation>();

        foreach (var constraint in constraints)
        {
            var violation = constraint.Type switch
            {
                ConstraintType.TrainingPrerequisite =>
                    await EvaluateTrainingAsync(constraint, userId, ct),
                ConstraintType.ConsumableAvailability =>
                    await EvaluateConsumableAsync(constraint, ct),
                ConstraintType.StaffRequirement =>
                    await EvaluateStaffAsync(constraint, slot, ct),
                _ => null
            };

            if (violation is not null)
                violations.Add(violation);
        }

        return new ConstraintEvaluationResult(!violations.Any(), violations);
    }

    private async Task<ConstraintViolation?> EvaluateTrainingAsync(
        Constraint constraint, Guid userId, CancellationToken ct)
    {
        var anyCompetencies = await _db.UserCompetencyCache.AnyAsync(ct);

        if (!anyCompetencies)
        {
            _logger.LogWarning("UserCompetencyCache is empty — skipping training constraint evaluation");
            return null;
        }

        var hasCompetency = await _db.UserCompetencyCache.AnyAsync(
            c => c.UserId == userId &&
                 c.CompetencyCode == constraint.Value &&
                 (!c.ExpiresAt.HasValue || c.ExpiresAt > DateTime.UtcNow), ct);

        if (!hasCompetency)
        {
            var msg = constraint.ErrorMessage ??
                      $"You need {constraint.Value} certification to book this resource.";
            return new ConstraintViolation(ConstraintType.TrainingPrerequisite, constraint.Value, msg);
        }

        return null;
    }

    private async Task<ConstraintViolation?> EvaluateConsumableAsync(Constraint constraint, CancellationToken ct)
    {
        var anyStock = await _db.ConsumableStockCache.AnyAsync(ct);

        if (!anyStock)
        {
            _logger.LogWarning("ConsumableStockCache is empty — skipping consumable constraint evaluation");
            return null;
        }

        var stock = await _db.ConsumableStockCache
            .FirstOrDefaultAsync(s => s.Sku == constraint.Value, ct);

        if (stock is null || stock.CurrentStock <= 0)
        {
            var msg = constraint.ErrorMessage ??
                      $"Consumable {constraint.Value} is out of stock.";
            return new ConstraintViolation(ConstraintType.ConsumableAvailability, constraint.Value, msg);
        }

        return null;
    }

    private async Task<ConstraintViolation?> EvaluateStaffAsync(Constraint constraint, TimeSlot slot, CancellationToken ct)
    {
        var availableTrainers = await _trainerSync.GetAvailableTrainersAsync(
            constraint.Value, slot.Start, slot.End, ct);

        if (!availableTrainers.Any())
        {
            var msg = constraint.ErrorMessage ??
                      $"No certified {constraint.Value} operator available during {slot.Start:hh:mm tt}–{slot.End:hh:mm tt}.";
            return new ConstraintViolation(ConstraintType.StaffRequirement, constraint.Value, msg);
        }

        return null;
    }
}
