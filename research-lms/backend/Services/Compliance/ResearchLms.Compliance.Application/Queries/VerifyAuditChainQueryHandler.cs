using MediatR;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Application.Queries;

public class VerifyAuditChainQueryHandler : IRequestHandler<VerifyAuditChainQuery, HashChainVerificationDto>
{
    private readonly IAuditService _auditService;

    public VerifyAuditChainQueryHandler(IAuditService auditService)
    {
        _auditService = auditService;
    }

    public async Task<HashChainVerificationDto> Handle(VerifyAuditChainQuery request, CancellationToken ct)
    {
        var result = await _auditService.VerifyChainAsync(ct);
        return new HashChainVerificationDto
        {
            IsIntact = result.IsIntact,
            TamperedEntryId = result.TamperedEntryId,
            ComputedHash = result.ComputedHash,
            StoredHash = result.StoredHash,
        };
    }
}
