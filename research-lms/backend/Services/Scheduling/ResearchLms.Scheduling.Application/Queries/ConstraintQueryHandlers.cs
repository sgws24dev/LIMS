using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetConstraintsQueryHandler : IRequestHandler<GetConstraintsQuery, IEnumerable<ConstraintDto>>
{
    private readonly IConstraintRepository _repo;
    private readonly IBookingResourceRepository _resourceRepo;

    public GetConstraintsQueryHandler(IConstraintRepository repo, IBookingResourceRepository resourceRepo)
    {
        _repo = repo;
        _resourceRepo = resourceRepo;
    }

    public async Task<IEnumerable<ConstraintDto>> Handle(GetConstraintsQuery request, CancellationToken ct)
    {
        var constraints = await _repo.GetByFilterAsync(request.ResourceId, request.Type, ct);
        var dtos = new List<ConstraintDto>();
        foreach (var c in constraints)
        {
            var resource = await _resourceRepo.GetByResourceIdAsync(c.ResourceId, ct);
            dtos.Add(new ConstraintDto(
                c.Id, c.ResourceId, resource?.Name ?? "Unknown",
                c.Type, c.Value, c.Description, c.ErrorMessage, c.IsActive));
        }
        return dtos;
    }
}

public class EvaluateConstraintsQueryHandler : IRequestHandler<EvaluateConstraintsQuery, ConstraintEvaluationResultDto>
{
    private readonly IConstraintEvaluationService _service;

    public EvaluateConstraintsQueryHandler(IConstraintEvaluationService service) => _service = service;

    public async Task<ConstraintEvaluationResultDto> Handle(EvaluateConstraintsQuery request, CancellationToken ct)
    {
        var slot = new Domain.ValueObjects.TimeSlot(request.StartTime, request.EndTime);
        var result = await _service.EvaluateAsync(request.ResourceId, request.UserId, slot, ct);

        return new ConstraintEvaluationResultDto(
            result.IsSatisfied,
            result.Violations.Select(v => new ConstraintViolationDto(
                v.Type.ToString(), v.Value, v.Message)));
    }
}
