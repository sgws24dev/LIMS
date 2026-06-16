using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record IngestTelemetryCommand(IngestTelemetryRequest Data) : IRequest<Result<Guid>>;
public record IngestTelemetryBatchCommand(IngestTelemetryBatchRequest Data) : IRequest<Result<IngestBatchResult>>;
