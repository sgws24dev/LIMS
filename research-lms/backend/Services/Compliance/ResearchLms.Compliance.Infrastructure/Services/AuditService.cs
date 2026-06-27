using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Compliance.Domain.ValueObjects;
using ResearchLms.Compliance.Infrastructure.Persistence;

namespace ResearchLms.Compliance.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly ComplianceDbContext _context;
    private readonly IAuditLogRepository _repository;

    public AuditService(ComplianceDbContext context, IAuditLogRepository repository)
    {
        _context = context;
        _repository = repository;
    }

    public async Task LogAsync(AuditLogEntry entry, CancellationToken ct = default)
    {
        await _repository.AddAsync(entry, ct);
    }

    public async Task<HashChainResult> VerifyChainAsync(CancellationToken ct = default)
    {
        var entries = await _context.AuditLogEntries
            .OrderBy(e => e.Timestamp)
            .ThenBy(e => e.CreatedAt)
            .ToListAsync(ct);

        string? previousHash = null;

        foreach (var entry in entries)
        {
            var computed = ComputeHash(previousHash, entry.Timestamp, entry.EntityType, entry.EntityId, entry.Operation, entry.NewValues);

            if (computed != entry.CurrentHash)
                return HashChainResult.Tampered(entry.Id.ToString(), computed, entry.CurrentHash);

            if (previousHash != entry.PreviousHash)
                return HashChainResult.Tampered(entry.Id.ToString(), $"prev:{previousHash}", $"stored:{entry.PreviousHash}");

            previousHash = computed;
        }

        return HashChainResult.Intact();
    }

    public static string ComputeHash(string? previousHash, DateTime timestamp, string entityType, Guid entityId, string operation, string? newValues)
    {
        var data = $"{previousHash ?? ""}|{timestamp:O}|{entityType}|{entityId}|{operation}|{newValues ?? ""}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexStringLower(bytes);
    }
}
