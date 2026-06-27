using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using ResearchLms.Compliance.Domain.Attributes;
using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Infrastructure.Services;

public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUser _currentUser;
    private readonly IChangeReasonProvider _changeReasonProvider;
    private readonly ILogger<AuditSaveChangesInterceptor> _logger;

    public AuditSaveChangesInterceptor(
        ICurrentUser currentUser,
        IChangeReasonProvider changeReasonProvider,
        ILogger<AuditSaveChangesInterceptor> logger)
    {
        _currentUser = currentUser;
        _changeReasonProvider = changeReasonProvider;
        _logger = logger;
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        var dbContext = eventData.Context;
        if (dbContext == null) return await base.SavingChangesAsync(eventData, result, ct);

        var entries = dbContext.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Where(e => e.Entity.GetType().GetCustomAttributes(typeof(AuditableAttribute), true).Length > 0)
            .ToList();

        foreach (var entry in entries)
        {
            try
            {
                var previousHash = (await dbContext.Set<AuditLogEntry>()
                    .OrderByDescending(l => l.Timestamp)
                    .Select(l => l.CurrentHash)
                    .FirstOrDefaultAsync(ct)) ?? "";

                var operation = entry.State switch
                {
                    EntityState.Added => "Create",
                    EntityState.Deleted => "Delete",
                    _ => "Update"
                };

                var changeReason = _changeReasonProvider.CurrentChangeReason;
                if (string.IsNullOrWhiteSpace(changeReason))
                    changeReason = $"Auto-logged {operation} by {_currentUser.Email}";

                var previousValues = entry.State == EntityState.Modified
                    ? GetValuesAsJson(entry.OriginalValues)
                    : null;

                var newValues = entry.State != EntityState.Deleted
                    ? GetValuesAsJson(entry.CurrentValues)
                    : null;

                var entityType = entry.Entity.GetType().Name;
                var entityId = entry.Entity.Id;

                var timestamp = DateTime.UtcNow;
                var currentHash = AuditService.ComputeHash(previousHash, timestamp, entityType, entityId, operation, newValues);

                var auditEntry = new AuditLogEntry(
                    entityType, entityId, operation,
                    previousValues, newValues,
                    _currentUser.UserId.ToString(), _currentUser.Name,
                    changeReason,
                    null, null,
                    previousHash, currentHash, _currentUser.Email);

                dbContext.Set<AuditLogEntry>().Add(auditEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create audit log entry for {EntityType}", entry.Entity.GetType().Name);
            }
        }

        return await base.SavingChangesAsync(eventData, result, ct);
    }

    private static string? GetValuesAsJson(PropertyValues values)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var prop in values.Properties)
        {
            if (prop.Name is "Id" or "TenantId" or "CreatedAt" or "UpdatedAt" or "CreatedBy" or "UpdatedBy" or "IsDeleted")
                continue;
            dict[prop.Name] = values[prop];
        }
        return System.Text.Json.JsonSerializer.Serialize(dict);
    }
}
