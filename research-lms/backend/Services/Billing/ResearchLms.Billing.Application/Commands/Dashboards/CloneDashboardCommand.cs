using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public record CloneDashboardCommand(Guid Id, string Name) : IRequest<DashboardDefinitionDto>;
