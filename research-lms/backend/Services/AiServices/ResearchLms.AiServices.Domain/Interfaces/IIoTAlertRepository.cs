using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IIoTAlertRepository
{
    Task<IReadOnlyList<IoTAlert>> GetByTenantAsync(Guid tenantId, Guid? instrumentId = null, Guid? ruleId = null,
        string? status = null, CancellationToken ct = default);
    Task<IoTAlert?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(IoTAlert alert, CancellationToken ct = default);
    Task UpdateAsync(IoTAlert alert, CancellationToken ct = default);
}
