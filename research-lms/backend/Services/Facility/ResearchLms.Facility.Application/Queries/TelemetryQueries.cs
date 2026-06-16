using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetLatestTelemetryQuery(Guid InstrumentId, int Count = 100)
    : IRequest<Result<IReadOnlyList<TelemetryRecordDto>>>;

public record GetTelemetrySummaryQuery(Guid InstrumentId)
    : IRequest<Result<TelemetrySummaryDto>>;
