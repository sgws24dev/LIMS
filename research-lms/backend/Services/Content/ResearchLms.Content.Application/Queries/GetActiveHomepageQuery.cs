using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Application.Queries;

public record GetActiveHomepageQuery : IRequest<HomepageDto?>;

public class GetActiveHomepageQueryHandler : IRequestHandler<GetActiveHomepageQuery, HomepageDto?>
{
    private readonly IHomepageRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetActiveHomepageQueryHandler(IHomepageRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<HomepageDto?> Handle(GetActiveHomepageQuery request, CancellationToken ct)
    {
        var homepage = await _repository.GetActiveAsync(_tenantContext.TenantId, ct);
        if (homepage == null) return null;

        return new HomepageDto(homepage.Id, homepage.Name, homepage.IsActive, homepage.LayoutJson);
    }
}
