using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Jobs;

public class CalibrationDueAlertJob : ICalibrationDueAlertJob
{
    private readonly ICalibrationRepository _repository;

    public CalibrationDueAlertJob(ICalibrationRepository repository)
    {
        _repository = repository;
    }

    public async Task ExecuteAsync()
    {
        var dueSoon = await _repository.GetDueSoonAsync(30);
        foreach (var record in dueSoon)
        {
            record.SetStatus(CalibrationStatus.DueSoon);
            await _repository.UpdateAsync(record);
        }

        var expired = await _repository.GetExpiredAsync();
        foreach (var record in expired)
        {
            record.SetStatus(CalibrationStatus.Expired);
            await _repository.UpdateAsync(record);
        }
    }
}
