using MediatR;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Enums;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record WalkthroughStepInput(int StepOrder, string Title, string Content, string? ElementSelector, WalkthroughPlacement Placement, WalkthroughActionType ActionType);

public record CreateWalkthroughCommand(
    string Name,
    string TargetRoute,
    WalkthroughTrigger Trigger,
    int Priority,
    bool IsActive,
    List<WalkthroughStepInput> Steps
) : IRequest<Guid>;

public class CreateWalkthroughCommandHandler : IRequestHandler<CreateWalkthroughCommand, Guid>
{
    private readonly IWalkthroughRepository _repository;

    public CreateWalkthroughCommandHandler(IWalkthroughRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateWalkthroughCommand request, CancellationToken ct)
    {
        var walkthrough = new Walkthrough(
            request.Name, request.TargetRoute, request.Trigger, request.Priority, request.IsActive);

        foreach (var step in request.Steps)
        {
            walkthrough.AddStep(new WalkthroughStep(
                walkthrough.Id, step.StepOrder, step.Title, step.Content,
                step.ElementSelector, step.Placement, step.ActionType));
        }

        await _repository.AddAsync(walkthrough, ct);
        return walkthrough.Id;
    }
}
