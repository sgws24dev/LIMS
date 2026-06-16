using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public class ResolveWorkOrderCommandHandler : IRequestHandler<ResolveWorkOrderCommand, Result>
{
    private readonly IWorkOrderRepository _repository;

    public ResolveWorkOrderCommandHandler(IWorkOrderRepository repository)
        => _repository = repository;

    public async Task<Result> Handle(ResolveWorkOrderCommand request, CancellationToken ct)
    {
        var workOrder = await _repository.GetByIdAsync(request.Id, ct);
        if (workOrder is null)
            return Result.Failure("NOT_FOUND", "Work order not found.");

        workOrder.Resolve(request.Data.ResolutionNotes);

        await _repository.UpdateAsync(workOrder, ct);
        return Result.Success();
    }
}
