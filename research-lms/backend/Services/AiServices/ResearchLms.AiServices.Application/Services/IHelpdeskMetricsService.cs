using ResearchLms.AiServices.Application.DTOs;

namespace ResearchLms.AiServices.Application.Services;

public interface IHelpdeskMetricsService
{
    Task<HelpdeskMetricsDto> GetMetricsAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct = default);
}
