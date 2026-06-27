using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Queries;

public record GetUnreadCountQuery : IRequest<int>;

public class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, int>
{
    private readonly INotificationRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public GetUnreadCountQueryHandler(INotificationRepository repository, ITenantContext tenantContext, ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(GetUnreadCountQuery request, CancellationToken ct)
    {
        return await _repository.GetUnreadCountAsync(_tenantContext.TenantId, _currentUser.UserId, ct);
    }
}
