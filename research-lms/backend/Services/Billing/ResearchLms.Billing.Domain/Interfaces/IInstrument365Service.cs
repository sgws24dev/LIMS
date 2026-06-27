using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IInstrument365Service
{
    Task<Instrument365Data> GetInstrument365DataAsync(Guid tenantId, Guid instrumentId, int year, CancellationToken ct = default);
}
