using MediatR;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public record DeleteDashboardCommand(Guid Id) : IRequest<Unit>;
