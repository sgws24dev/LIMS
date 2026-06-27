using MediatR;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public class DeleteDashboardCommandHandler : IRequestHandler<DeleteDashboardCommand, Unit>
{
    private readonly IDashboardRepository _repository;
    private readonly ITenantContext _tenantContext;

    public DeleteDashboardCommandHandler(IDashboardRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<Unit> Handle(DeleteDashboardCommand request, CancellationToken ct)
    {
        var dashboard = await _repository.GetByIdAsync(request.Id, ct);
        if (dashboard == null)
            throw new KeyNotFoundException($"Dashboard {request.Id} not found");

        dashboard.MarkDeleted("system");
        await _repository.UpdateAsync(dashboard, ct);

        return Unit.Value;
    }
}
