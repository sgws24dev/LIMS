using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Milestones;

public class UpdateMilestoneStatusCommandHandler : IRequestHandler<UpdateMilestoneStatusCommand, ApiResponse<MilestoneDto>>
{
    private readonly IMilestoneRepository _repository;

    public UpdateMilestoneStatusCommandHandler(IMilestoneRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<MilestoneDto>> Handle(UpdateMilestoneStatusCommand request, CancellationToken ct)
    {
        var milestone = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.RequestMilestone), request.Id);

        switch (request.Action.ToLowerInvariant())
        {
            case "start":
                milestone.Start(request.ModifiedBy);
                break;
            case "complete":
                milestone.Complete(request.ModifiedBy);
                break;
            case "skip":
                milestone.Skip(request.ModifiedBy);
                break;
            default:
                throw new ArgumentException($"Invalid milestone action: {request.Action}");
        }

        await _repository.UpdateAsync(milestone, ct);

        return new ApiResponse<MilestoneDto>(true, new MilestoneDto(
            milestone.Id,
            milestone.ServiceRequestId,
            milestone.Title,
            milestone.Description,
            milestone.Order,
            milestone.Status.ToString(),
            milestone.DueDate,
            milestone.CompletedAt,
            milestone.CompletedBy,
            milestone.AssignedTo
        ));
    }
}
