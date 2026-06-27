using MediatR;
using ResearchLms.Content.Domain.Enums;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record UpdateWalkthroughCommand(
    Guid Id,
    string Name,
    string TargetRoute,
    WalkthroughTrigger Trigger,
    int Priority,
    bool IsActive
) : IRequest;

public class UpdateWalkthroughCommandHandler : IRequestHandler<UpdateWalkthroughCommand>
{
    private readonly IWalkthroughRepository _repository;

    public UpdateWalkthroughCommandHandler(IWalkthroughRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateWalkthroughCommand request, CancellationToken ct)
    {
        var walkthrough = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Walkthrough {request.Id} not found");

        walkthrough.Update(request.Name, request.TargetRoute, request.Trigger, request.Priority, request.IsActive);
        await _repository.UpdateAsync(walkthrough, ct);
    }
}
