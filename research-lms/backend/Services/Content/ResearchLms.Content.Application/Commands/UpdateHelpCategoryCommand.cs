using MediatR;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record UpdateHelpCategoryCommand(
    Guid Id,
    string Name,
    string Slug,
    int SortOrder,
    Guid? ParentCategoryId
) : IRequest;

public class UpdateHelpCategoryCommandHandler : IRequestHandler<UpdateHelpCategoryCommand>
{
    private readonly IHelpCategoryRepository _repository;

    public UpdateHelpCategoryCommandHandler(IHelpCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateHelpCategoryCommand request, CancellationToken ct)
    {
        var category = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Help category {request.Id} not found");

        category.Update(request.Name, request.Slug, request.SortOrder, request.ParentCategoryId);
        await _repository.UpdateAsync(category, ct);
    }
}
