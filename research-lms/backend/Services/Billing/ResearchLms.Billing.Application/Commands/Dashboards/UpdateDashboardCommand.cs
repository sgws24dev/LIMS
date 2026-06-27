using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public record UpdateDashboardCommand(
    Guid Id,
    string Name,
    string? Description,
    string Layout,
    bool IsDefault
) : IRequest<DashboardDefinitionDto>;
