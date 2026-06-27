using MediatR;
using ResearchLms.Billing.Application.Commands.ReportSchedules;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record GetReportSchedulesQuery : IRequest<List<ReportScheduleDto>>;

public class GetReportSchedulesQueryHandler : IRequestHandler<GetReportSchedulesQuery, List<ReportScheduleDto>>
{
    private readonly IReportScheduleRepository _repository;

    public GetReportSchedulesQueryHandler(IReportScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ReportScheduleDto>> Handle(GetReportSchedulesQuery request, CancellationToken ct)
    {
        var schedules = await _repository.GetAllAsync(ct);
        return schedules.Select(CreateReportScheduleCommandHandler.MapToDto).ToList();
    }
}

public record GetReportScheduleByIdQuery(Guid Id) : IRequest<ReportScheduleDto>;

public class GetReportScheduleByIdQueryHandler : IRequestHandler<GetReportScheduleByIdQuery, ReportScheduleDto>
{
    private readonly IReportScheduleRepository _repository;

    public GetReportScheduleByIdQueryHandler(IReportScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReportScheduleDto> Handle(GetReportScheduleByIdQuery request, CancellationToken ct)
    {
        var schedule = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new InvalidOperationException($"Report schedule not found: {request.Id}");
        return CreateReportScheduleCommandHandler.MapToDto(schedule);
    }
}
