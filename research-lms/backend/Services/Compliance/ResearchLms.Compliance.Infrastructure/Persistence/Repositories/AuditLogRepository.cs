using Microsoft.EntityFrameworkCore;
using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Compliance.Infrastructure.Persistence;

namespace ResearchLms.Compliance.Infrastructure.Persistence.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly ComplianceDbContext _context;

    public AuditLogRepository(ComplianceDbContext context)
    {
        _context = context;
    }

    public async Task<AuditLogEntry?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.AuditLogEntries.FindAsync(new object[] { id }, ct);
    }

    public async Task<AuditLogEntry?> GetLatestAsync(CancellationToken ct = default)
    {
        return await _context.AuditLogEntries
            .OrderByDescending(e => e.Timestamp)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<AuditLogEntry>> GetAllAsync(
        string? entityType = null, Guid? entityId = null, string? userId = null,
        DateTime? dateFrom = null, DateTime? dateTo = null, string? operation = null,
        int page = 1, int pageSize = 50, CancellationToken ct = default)
    {
        var query = _context.AuditLogEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(e => e.EntityType == entityType);
        if (entityId.HasValue)
            query = query.Where(e => e.EntityId == entityId.Value);
        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(e => e.ChangedByUserId == userId);
        if (dateFrom.HasValue)
            query = query.Where(e => e.Timestamp >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(e => e.Timestamp <= dateTo.Value);
        if (!string.IsNullOrWhiteSpace(operation))
            query = query.Where(e => e.Operation == operation);

        return await query
            .OrderByDescending(e => e.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(
        string? entityType = null, Guid? entityId = null, string? userId = null,
        DateTime? dateFrom = null, DateTime? dateTo = null, string? operation = null,
        CancellationToken ct = default)
    {
        var query = _context.AuditLogEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(e => e.EntityType == entityType);
        if (entityId.HasValue)
            query = query.Where(e => e.EntityId == entityId.Value);
        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(e => e.ChangedByUserId == userId);
        if (dateFrom.HasValue)
            query = query.Where(e => e.Timestamp >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(e => e.Timestamp <= dateTo.Value);
        if (!string.IsNullOrWhiteSpace(operation))
            query = query.Where(e => e.Operation == operation);

        return await query.CountAsync(ct);
    }

    public async Task<IReadOnlyList<AuditLogEntry>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default)
    {
        return await _context.AuditLogEntries
            .Where(e => e.EntityType == entityType && e.EntityId == entityId)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(ct);
    }

    public async Task AddAsync(AuditLogEntry entry, CancellationToken ct = default)
    {
        await _context.AuditLogEntries.AddAsync(entry, ct);
        await _context.SaveChangesAsync(ct);
    }
}
