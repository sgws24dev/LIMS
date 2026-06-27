using MediatR;
using ResearchLms.Compliance.Application.DTOs;

namespace ResearchLms.Compliance.Application.Queries;

public record VerifyAuditChainQuery : IRequest<HashChainVerificationDto>;
