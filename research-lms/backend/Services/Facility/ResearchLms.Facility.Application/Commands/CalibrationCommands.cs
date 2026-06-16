using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record CreateCalibrationRecordCommand(CreateCalibrationRecordRequest Data) : IRequest<Result<Guid>>;
public record UpdateCalibrationRecordCommand(Guid Id, UpdateCalibrationRecordRequest Data) : IRequest<Result>;
