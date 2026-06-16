using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetCustodyChainQuery(Guid AssetId, int Page = 1, int PageSize = 20)
    : IRequest<Result<(IReadOnlyList<CustodyEventDto> Items, int TotalCount)>>;

public record GetCurrentCustodianQuery(Guid AssetId) : IRequest<Result<CustodyEventDto?>>;
