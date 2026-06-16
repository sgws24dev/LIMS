using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetDepreciationScheduleQuery(Guid AssetId) : IRequest<Result<IEnumerable<DepreciationScheduleEntry>>>;
