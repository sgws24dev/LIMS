using MediatR;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.ReportSchedules;

public record DeleteReportScheduleCommand(Guid Id) : IRequest<Unit>;

public class DeleteReportScheduleCommandHandler : IRequestHandler<DeleteReportScheduleCommand, Unit>
{
    private readonly IReportScheduleRepository _repository;

    public DeleteReportScheduleCommandHandler(IReportScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(DeleteReportScheduleCommand request, CancellationToken ct)
    {
        var schedule = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new InvalidOperationException($"Report schedule not found: {request.Id}");

        await _repository.DeleteAsync(schedule, ct);
        return Unit.Value;
    }
}
