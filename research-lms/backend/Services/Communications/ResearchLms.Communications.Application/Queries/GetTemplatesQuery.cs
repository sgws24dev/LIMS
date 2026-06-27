using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Queries;

public record GetTemplatesQuery : IRequest<IReadOnlyList<NotificationTemplateDto>>;

public class GetTemplatesQueryHandler : IRequestHandler<GetTemplatesQuery, IReadOnlyList<NotificationTemplateDto>>
{
    private readonly INotificationTemplateRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetTemplatesQueryHandler(INotificationTemplateRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<NotificationTemplateDto>> Handle(GetTemplatesQuery request, CancellationToken ct)
    {
        var templates = await _repository.GetAllAsync(_tenantContext.TenantId, ct);

        return templates.Select(t => new NotificationTemplateDto(
            t.Id, t.Name, t.Channel.ToString(), t.Subject, t.Body, t.IsDefault, t.CreatedAt)).ToList();
    }
}
