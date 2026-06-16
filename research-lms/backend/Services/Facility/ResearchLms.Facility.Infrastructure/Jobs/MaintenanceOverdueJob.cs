using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Jobs;

public class MaintenanceOverdueJob : IMaintenanceOverdueJob
{
    private readonly IMaintenanceRepository _repository;

    public MaintenanceOverdueJob(IMaintenanceRepository repository)
    {
        _repository = repository;
    }

    public async Task ExecuteAsync()
    {
        var overdue = await _repository.GetOverdueRecordsAsync();

        foreach (var record in overdue)
        {
            record.MarkOverdue();
            await _repository.UpdateAsync(record);
        }
    }
}
