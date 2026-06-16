using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetCalibrationRecordsQuery(
    Guid? InstrumentId, string? Status, int Page = 1, int PageSize = 20)
    : IRequest<Result<(IReadOnlyList<CalibrationRecordDto> Items, int TotalCount)>>;

public record GetCalibrationRecordByIdQuery(Guid Id) : IRequest<Result<CalibrationRecordDto>>;

public record GetCalibrationSummaryQuery() : IRequest<Result<CalibrationDueSummaryDto>>;
