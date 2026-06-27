using MediatR;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Reports;

public record DeleteReportDefinitionCommand(Guid Id) : IRequest;

public class DeleteReportDefinitionCommandHandler : IRequestHandler<DeleteReportDefinitionCommand>
{
    private readonly IReportRepository _repository;

    public DeleteReportDefinitionCommandHandler(IReportRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteReportDefinitionCommand request, CancellationToken ct)
    {
        var report = await _repository.GetByIdAsync(request.Id, ct);
        if (report is null) return;
        await _repository.DeleteAsync(report, ct);
    }
}
