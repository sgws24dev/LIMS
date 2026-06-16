using MediatR;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Handlers;

public class CreateConstraintCommandHandler : IRequestHandler<CreateConstraintCommand, Guid>
{
    private readonly IConstraintRepository _repo;

    public CreateConstraintCommandHandler(IConstraintRepository repo) => _repo = repo;

    public async Task<Guid> Handle(CreateConstraintCommand request, CancellationToken ct)
    {
        var constraint = new Constraint
        {
            ResourceId = request.ResourceId,
            ResourceType = request.ResourceType,
            Type = request.Type,
            Value = request.Value,
            Description = request.Description,
            ErrorMessage = request.ErrorMessage
        };

        await _repo.AddAsync(constraint, ct);
        return constraint.Id;
    }
}

public class UpdateConstraintCommandHandler : IRequestHandler<UpdateConstraintCommand, Unit>
{
    private readonly IConstraintRepository _repo;

    public UpdateConstraintCommandHandler(IConstraintRepository repo) => _repo = repo;

    public async Task<Unit> Handle(UpdateConstraintCommand request, CancellationToken ct)
    {
        var constraint = await _repo.GetByIdAsync(request.ConstraintId, ct);
        if (constraint is null) throw new NotFoundException("Constraint not found.");

        constraint.Value = request.Value;
        constraint.Description = request.Description;
        constraint.ErrorMessage = request.ErrorMessage;
        constraint.IsActive = request.IsActive;

        await _repo.UpdateAsync(constraint, ct);
        return Unit.Value;
    }
}

public class DeleteConstraintCommandHandler : IRequestHandler<DeleteConstraintCommand, Unit>
{
    private readonly IConstraintRepository _repo;

    public DeleteConstraintCommandHandler(IConstraintRepository repo) => _repo = repo;

    public async Task<Unit> Handle(DeleteConstraintCommand request, CancellationToken ct)
    {
        var constraint = await _repo.GetByIdAsync(request.ConstraintId, ct);
        if (constraint is null) throw new NotFoundException("Constraint not found.");

        await _repo.DeleteAsync(constraint, ct);
        return Unit.Value;
    }
}
