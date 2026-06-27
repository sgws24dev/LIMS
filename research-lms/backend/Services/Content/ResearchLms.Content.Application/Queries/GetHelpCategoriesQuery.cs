using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Queries;

public record GetHelpCategoriesQuery : IRequest<IReadOnlyList<HelpCategoryDto>>;

public class GetHelpCategoriesQueryHandler : IRequestHandler<GetHelpCategoriesQuery, IReadOnlyList<HelpCategoryDto>>
{
    private readonly IHelpCategoryRepository _repository;
    private readonly ResearchLms.Shared.Abstractions.ITenantContext _tenantContext;

    public GetHelpCategoriesQueryHandler(IHelpCategoryRepository repository, ResearchLms.Shared.Abstractions.ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<HelpCategoryDto>> Handle(GetHelpCategoriesQuery request, CancellationToken ct)
    {
        var categories = await _repository.GetAllAsync(_tenantContext.TenantId, ct);
        return categories.Select(c => new HelpCategoryDto(
            c.Id, c.Name, c.Slug, c.SortOrder, c.ParentCategoryId
        )).ToList();
    }
}
