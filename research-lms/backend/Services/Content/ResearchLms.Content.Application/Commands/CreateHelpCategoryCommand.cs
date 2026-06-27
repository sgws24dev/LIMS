using MediatR;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record CreateHelpCategoryCommand(
    string Name,
    string Slug,
    int SortOrder,
    Guid? ParentCategoryId
) : IRequest<Guid>;

public class CreateHelpCategoryCommandHandler : IRequestHandler<CreateHelpCategoryCommand, Guid>
{
    private readonly IHelpCategoryRepository _repository;

    public CreateHelpCategoryCommandHandler(IHelpCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateHelpCategoryCommand request, CancellationToken ct)
    {
        var category = new HelpCategory(request.Name, request.Slug, request.SortOrder, request.ParentCategoryId);
        await _repository.AddAsync(category, ct);
        return category.Id;
    }
}
