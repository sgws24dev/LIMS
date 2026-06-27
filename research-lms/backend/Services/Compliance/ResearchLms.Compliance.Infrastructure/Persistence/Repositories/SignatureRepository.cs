using Microsoft.EntityFrameworkCore;
using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Compliance.Infrastructure.Persistence;

namespace ResearchLms.Compliance.Infrastructure.Persistence.Repositories;

public class SignatureRepository : ISignatureRepository
{
    private readonly ComplianceDbContext _context;

    public SignatureRepository(ComplianceDbContext context)
    {
        _context = context;
    }

    public async Task<Signature?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Signatures.FindAsync(new object[] { id }, ct);
    }

    public async Task<IReadOnlyList<Signature>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default)
    {
        return await _context.Signatures
            .Where(s => s.SignedEntityType == entityType && s.SignedEntityId == entityId)
            .OrderByDescending(s => s.SignedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Signature signature, CancellationToken ct = default)
    {
        await _context.Signatures.AddAsync(signature, ct);
        await _context.SaveChangesAsync(ct);
    }
}
