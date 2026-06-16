using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetCurrentCustodianQueryHandler : IRequestHandler<GetCurrentCustodianQuery, Result<CustodyEventDto?>>
{
    private readonly ICustodyRepository _repository;

    public GetCurrentCustodianQueryHandler(ICustodyRepository repository)
        => _repository = repository;

    public async Task<Result<CustodyEventDto?>> Handle(GetCurrentCustodianQuery request, CancellationToken ct)
    {
        var custodyEvent = await _repository.GetCurrentCustodianAsync(request.AssetId, ct);
        if (custodyEvent is null)
            return Result.Success<CustodyEventDto?>(null);

        var dto = new CustodyEventDto(
            custodyEvent.Id, custodyEvent.AssetId, custodyEvent.Asset?.Name,
            custodyEvent.FromUserName, custodyEvent.ToUserName,
            custodyEvent.FromLocation, custodyEvent.ToLocation,
            custodyEvent.TransferredAt, custodyEvent.Reason,
            custodyEvent.SignatureRef is not null, custodyEvent.Notes);

        return Result.Success<CustodyEventDto?>(dto);
    }
}
