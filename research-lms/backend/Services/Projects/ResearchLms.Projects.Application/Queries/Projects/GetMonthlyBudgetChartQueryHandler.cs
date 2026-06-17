using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Projects;

public class GetMonthlyBudgetChartQueryHandler : IRequestHandler<GetMonthlyBudgetChartQuery, IEnumerable<MonthlyBudgetDataPoint>>
{
    private readonly IWorkOrderRepository _repository;

    public GetMonthlyBudgetChartQueryHandler(IWorkOrderRepository repository) => _repository = repository;

    public async Task<IEnumerable<MonthlyBudgetDataPoint>> Handle(GetMonthlyBudgetChartQuery request, CancellationToken ct)
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-request.MonthsBack));

        var all = await _repository.GetPagedAsync(null, WorkOrderStatus.Completed, null, null, 1, 10000, ct);
        var completed = all.Items.Where(w => w.CompletedAt.HasValue &&
            DateOnly.FromDateTime(w.CompletedAt.Value) >= cutoff);

        var grouped = completed
            .GroupBy(w => new { w.CompletedAt!.Value.Year, w.CompletedAt.Value.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var date = new DateTime(g.Key.Year, g.Key.Month, 1);
                return new MonthlyBudgetDataPoint(
                    date.ToString("MMM yyyy"),
                    g.Sum(w => w.EstimatedHours * 100),
                    g.Sum(w => w.BilledAmount));
            });

        return grouped;
    }
}
