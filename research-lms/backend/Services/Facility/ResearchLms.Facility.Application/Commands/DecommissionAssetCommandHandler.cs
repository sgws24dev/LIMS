using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public class DecommissionAssetCommandHandler : IRequestHandler<DecommissionAssetCommand, Result>
{
    private readonly IAssetRepository _repository;

    public DecommissionAssetCommandHandler(IAssetRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DecommissionAssetCommand request, CancellationToken ct)
    {
        var asset = await _repository.GetByIdAsync(request.Id, ct);
        if (asset is null)
            return Result.Failure("NOT_FOUND", "Asset not found.");

        asset.Decommission();
        await _repository.UpdateAsync(asset, ct);

        return Result.Success();
    }
}
