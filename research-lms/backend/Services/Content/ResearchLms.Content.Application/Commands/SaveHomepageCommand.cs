using MediatR;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Application.Commands;

public record SaveHomepageCommand(string Name, bool IsActive, string LayoutJson) : IRequest;

public class SaveHomepageCommandHandler : IRequestHandler<SaveHomepageCommand>
{
    private readonly IHomepageRepository _repository;
    private readonly ITenantContext _tenantContext;

    public SaveHomepageCommandHandler(IHomepageRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task Handle(SaveHomepageCommand request, CancellationToken ct)
    {
        var existing = await _repository.GetActiveAsync(_tenantContext.TenantId, ct);
        if (existing != null)
        {
            existing.Update(request.Name, request.IsActive, request.LayoutJson);
            await _repository.UpsertAsync(existing, ct);
        }
        else
        {
            var homepage = new HomepageDefinition(request.Name, request.IsActive, request.LayoutJson);
            await _repository.UpsertAsync(homepage, ct);
        }
    }
}
