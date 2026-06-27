using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IAggregationRepository
{
    Task<AggregationTable?> GetAsync(AggregationGranularity granularity, DateTime dateKey, string metricName, CancellationToken ct = default);
    Task UpsertAsync(AggregationTable row, CancellationToken ct = default);
    Task<List<AggregationTable>> GetByDateRangeAsync(AggregationGranularity granularity, DateTime from, DateTime to, CancellationToken ct = default);
}
