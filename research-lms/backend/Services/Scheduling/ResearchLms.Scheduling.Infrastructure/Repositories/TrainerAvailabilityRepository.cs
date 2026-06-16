using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class TrainerAvailabilityRepository : ITrainerAvailabilityRepository
{
    private readonly SchedulingDbContext _context;
    public TrainerAvailabilityRepository(SchedulingDbContext context) => _context = context;

    public async Task<TrainerAvailability?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _context.TrainerAvailability.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<TrainerAvailability>> GetByUserAsync(Guid userId, CancellationToken ct) =>
        await _context.TrainerAvailability
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .OrderBy(t => t.DayOfWeek).ThenBy(t => t.StartTime)
            .ToListAsync(ct);

    public async Task<IEnumerable<TrainerAvailability>> GetByUserAndRangeAsync(
        Guid userId, DateOnly weekStart, CancellationToken ct)
    {
        var weekEnd = weekStart.AddDays(7);
        return await _context.TrainerAvailability
            .Where(t => t.UserId == userId && !t.IsDeleted
                && t.EffectiveFrom <= weekEnd
                && (t.EffectiveTo == null || t.EffectiveTo >= weekStart))
            .OrderBy(t => t.DayOfWeek).ThenBy(t => t.StartTime)
            .ToListAsync(ct);
    }

    public async Task<TrainerAvailability> AddAsync(TrainerAvailability availability, CancellationToken ct)
    {
        _context.TrainerAvailability.Add(availability);
        await _context.SaveChangesAsync(ct);
        return availability;
    }

    public async Task UpdateAsync(TrainerAvailability availability, CancellationToken ct)
    {
        _context.TrainerAvailability.Update(availability);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var item = await _context.TrainerAvailability.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (item is not null)
        {
            item.MarkDeleted("System");
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<IEnumerable<TrainerAvailability>> GetAvailableForSlotAsync(
        string requiredRole, DateTime slotStart, DateTime slotEnd, CancellationToken ct)
    {
        var dayOfWeek = slotStart.DayOfWeek;
        var startTime = TimeOnly.FromDateTime(slotStart);
        var endTime = TimeOnly.FromDateTime(slotEnd);
        var date = DateOnly.FromDateTime(slotStart);

        // Find trainers who have no blocking slot in the requested window
        var blockedUserIds = await _context.TrainerAvailability
            .Where(t => t.DayOfWeek == dayOfWeek && !t.IsAvailable && !t.IsDeleted
                && t.StartTime < endTime && t.EndTime > startTime
                && t.EffectiveFrom <= date
                && (t.EffectiveTo == null || t.EffectiveTo >= date))
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync(ct);

        // Get available slots for non-blocked trainers who have a matching role
        // Join with UserCompetencyCache for role matching
        var available = await (
            from t in _context.TrainerAvailability
            join c in _context.UserCompetencyCache
                on new { UserId = t.UserId, Competency = requiredRole }
                equals new { c.UserId, Competency = c.CompetencyCode }
            where t.DayOfWeek == dayOfWeek && t.IsAvailable && !t.IsDeleted
                && t.StartTime <= startTime && t.EndTime >= endTime
                && t.EffectiveFrom <= date
                && (t.EffectiveTo == null || t.EffectiveTo >= date)
                && !blockedUserIds.Contains(t.UserId)
            select t
        ).Distinct().ToListAsync(ct);

        return available;
    }

    public async Task<IEnumerable<string>> GetExternalEventIdsAsync(Guid userId, CancellationToken ct) =>
        await _context.TrainerAvailability
            .Where(t => t.UserId == userId && t.ExternalEventId != null && !t.IsDeleted)
            .Select(t => t.ExternalEventId!)
            .ToListAsync(ct);
}
