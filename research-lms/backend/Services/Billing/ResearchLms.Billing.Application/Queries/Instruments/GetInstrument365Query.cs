using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Queries.Instruments;

public record GetInstrument365Query(Guid InstrumentId, int Year) : IRequest<Instrument365Dto>;

public class GetInstrument365QueryHandler : IRequestHandler<GetInstrument365Query, Instrument365Dto>
{
    private readonly IInstrument365Service _service;
    private readonly ITenantContext _tenantContext;

    public GetInstrument365QueryHandler(IInstrument365Service service, ITenantContext tenantContext)
    {
        _service = service;
        _tenantContext = tenantContext;
    }

    public async Task<Instrument365Dto> Handle(GetInstrument365Query request, CancellationToken ct)
    {
        var data = await _service.GetInstrument365DataAsync(_tenantContext.TenantId, request.InstrumentId, request.Year, ct);

        return new Instrument365Dto
        {
            DailyMetrics = data.DailyMetrics.Select(m => new InstrumentDailyMetricDto
            {
                Date = m.Date,
                TotalBookings = m.TotalBookings,
                UtilizedHours = m.UtilizedHours,
                IdleHours = m.IdleHours,
                DowntimeHours = m.DowntimeHours,
                RevenueGenerated = m.RevenueGenerated,
                ServiceEventCount = m.ServiceEventCount,
                MaintenanceHours = m.MaintenanceHours,
            }).ToList(),
            Summary = new Instrument365SummaryDto
            {
                TotalRevenue = data.Summary.TotalRevenue,
                UtilizationPercent = data.Summary.UtilizationPercent,
                DowntimePercent = data.Summary.DowntimePercent,
                AvgBookingsPerDay = data.Summary.AvgBookingsPerDay,
                TopServiceMonth = data.Summary.TopServiceMonth,
            },
        };
    }
}
