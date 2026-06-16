using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Queries;

public record GetResourcesQuery(
    string? Query,
    ResourceType? Type,
    Guid? TenantId
) : IRequest<IEnumerable<BookingResourceDto>>;
