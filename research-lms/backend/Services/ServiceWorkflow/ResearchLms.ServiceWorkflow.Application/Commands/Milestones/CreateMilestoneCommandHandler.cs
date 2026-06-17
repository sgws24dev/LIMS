using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Milestones;

public class CreateMilestoneCommandHandler : IRequestHandler<CreateMilestoneCommand, ApiResponse<MilestoneDto>>
{
    private readonly IMilestoneRepository _repository;
    private readonly IServiceRequestRepository _requestRepository;

    public CreateMilestoneCommandHandler(IMilestoneRepository repository, IServiceRequestRepository requestRepository)
    {
        _repository = repository;
        _requestRepository = requestRepository;
    }

    public async Task<ApiResponse<MilestoneDto>> Handle(CreateMilestoneCommand request, CancellationToken ct)
    {
        var sr = await _requestRepository.GetByIdAsync(request.ServiceRequestId, ct)
            ?? throw new NotFoundException(nameof(ServiceRequest), request.ServiceRequestId);

        var milestone = new RequestMilestone(
            request.ServiceRequestId,
            request.Title,
            request.Description,
            request.Order,
            request.CreatedBy,
            request.DueDate,
            request.AssignedTo);

        await _repository.AddAsync(milestone, ct);

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
