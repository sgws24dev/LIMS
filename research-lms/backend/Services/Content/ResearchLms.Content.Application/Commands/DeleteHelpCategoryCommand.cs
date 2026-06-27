using MediatR;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record DeleteHelpCategoryCommand(Guid Id) : IRequest;

public class DeleteHelpCategoryCommandHandler : IRequestHandler<DeleteHelpCategoryCommand>
{
    private readonly IHelpCategoryRepository _repository;

    public DeleteHelpCategoryCommandHandler(IHelpCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteHelpCategoryCommand request, CancellationToken ct)
    {
        await _repository.DeleteAsync(request.Id, ct);
    }
}
