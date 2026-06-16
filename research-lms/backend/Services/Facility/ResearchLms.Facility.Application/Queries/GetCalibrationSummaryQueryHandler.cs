using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetCalibrationSummaryQueryHandler
    : IRequestHandler<GetCalibrationSummaryQuery, Result<CalibrationDueSummaryDto>>
{
    private readonly ICalibrationRepository _repository;

    public GetCalibrationSummaryQueryHandler(ICalibrationRepository repository)
        => _repository = repository;

    public async Task<Result<CalibrationDueSummaryDto>> Handle(
        GetCalibrationSummaryQuery request, CancellationToken ct)
    {
        var summary = await _repository.GetSummaryAsync(ct);
        var dto = new CalibrationDueSummaryDto(
            summary.DueSoonCount, summary.ExpiredCount,
            summary.ValidCount, summary.DueSoonCount + summary.ExpiredCount + summary.ValidCount);

        return Result.Success(dto);
    }
}
