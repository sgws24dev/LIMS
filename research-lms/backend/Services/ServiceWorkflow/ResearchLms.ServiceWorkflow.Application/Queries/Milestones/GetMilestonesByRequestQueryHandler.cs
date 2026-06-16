using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.Milestones;

public class GetMilestonesByRequestQueryHandler : IRequestHandler<GetMilestonesByRequestQuery, ApiResponse<IReadOnlyList<MilestoneDto>>>
{
    private readonly IMilestoneRepository _repository;

    public GetMilestonesByRequestQueryHandler(IMilestoneRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<IReadOnlyList<MilestoneDto>>> Handle(GetMilestonesByRequestQuery request, CancellationToken ct)
    {
        var milestones = await _repository.GetByRequestIdAsync(request.ServiceRequestId, ct);

        var dtos = milestones.OrderBy(m => m.Order).Select(m => new MilestoneDto(
            m.Id, m.ServiceRequestId, m.Title, m.Description, m.Order,
            m.Status.ToString(), m.CompletedAt, m.CompletedBy, m.AssignedTo
        )).ToList();

        return new ApiResponse<IReadOnlyList<MilestoneDto>>(true, dtos);
    }
}
