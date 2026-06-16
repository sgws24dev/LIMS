using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetCustodyChainQueryHandler
    : IRequestHandler<GetCustodyChainQuery, Result<(IReadOnlyList<CustodyEventDto> Items, int TotalCount)>>
{
    private readonly ICustodyRepository _repository;

    public GetCustodyChainQueryHandler(ICustodyRepository repository)
        => _repository = repository;

    public async Task<Result<(IReadOnlyList<CustodyEventDto> Items, int TotalCount)>> Handle(
        GetCustodyChainQuery request, CancellationToken ct)
    {
        var (items, totalCount) = await _repository.GetChainAsync(
            request.AssetId, request.Page, request.PageSize, ct);

        var dtos = items.Select(e => new CustodyEventDto(
            e.Id, e.AssetId, e.Asset?.Name, e.FromUserName, e.ToUserName,
            e.FromLocation, e.ToLocation, e.TransferredAt,
            e.Reason, e.SignatureRef is not null, e.Notes)).ToList();

        return Result.Success((dtos as IReadOnlyList<CustodyEventDto>, totalCount));
    }
}
