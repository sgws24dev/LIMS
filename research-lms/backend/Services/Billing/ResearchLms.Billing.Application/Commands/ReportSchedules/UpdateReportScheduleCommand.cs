using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.ReportSchedules;

public record UpdateReportScheduleCommand(
    Guid Id,
    string CronExpression,
    string TimeZoneId,
    string Format,
    string Recipients,
    string Subject,
    bool IsActive) : IRequest<ReportScheduleDto>;

public class UpdateReportScheduleCommandHandler : IRequestHandler<UpdateReportScheduleCommand, ReportScheduleDto>
{
    private readonly IReportScheduleRepository _repository;

    public UpdateReportScheduleCommandHandler(IReportScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReportScheduleDto> Handle(UpdateReportScheduleCommand request, CancellationToken ct)
    {
        var schedule = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new InvalidOperationException($"Report schedule not found: {request.Id}");

        if (!Enum.TryParse<ReportFormat>(request.Format, true, out var format))
            throw new InvalidOperationException($"Invalid format: {request.Format}");

        const string userName = "system";

        schedule.Update(
            request.CronExpression,
            request.TimeZoneId,
            format,
            request.Recipients,
            request.Subject,
            request.IsActive,
            userName);

        await _repository.UpdateAsync(schedule, ct);

        return CreateReportScheduleCommandHandler.MapToDto(schedule);
    }
}
