using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.ReportSchedules;

public record CreateReportScheduleCommand(
    Guid ReportDefinitionId,
    string CronExpression,
    string TimeZoneId,
    string Format,
    string Recipients,
    string Subject) : IRequest<ReportScheduleDto>;

public class CreateReportScheduleCommandHandler : IRequestHandler<CreateReportScheduleCommand, ReportScheduleDto>
{
    private readonly IReportScheduleRepository _repository;

    public CreateReportScheduleCommandHandler(IReportScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReportScheduleDto> Handle(CreateReportScheduleCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<ReportFormat>(request.Format, true, out var format))
            throw new InvalidOperationException($"Invalid format: {request.Format}");

        const string userName = "system";

        var schedule = new ReportSchedule(
            request.ReportDefinitionId,
            request.CronExpression,
            request.TimeZoneId,
            format,
            request.Recipients,
            request.Subject,
            userName);

        await _repository.AddAsync(schedule, ct);

        return MapToDto(schedule);
    }

    internal static ReportScheduleDto MapToDto(ReportSchedule schedule)
    {
        return new ReportScheduleDto
        {
            Id = schedule.Id,
            ReportDefinitionId = schedule.ReportDefinitionId,
            ReportDefinitionName = schedule.ReportDefinition?.Name,
            CronExpression = schedule.CronExpression,
            TimeZoneId = schedule.TimeZoneId,
            Format = schedule.Format.ToString(),
            Recipients = schedule.Recipients,
            Subject = schedule.Subject,
            IsActive = schedule.IsActive,
            LastDeliveredAt = schedule.LastDeliveredAt,
            NextRunAt = schedule.NextRunAt,
            CreatedAt = schedule.CreatedAt,
        };
    }
}
