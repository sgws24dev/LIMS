using MediatR;
using ResearchLms.Institution.Application.DTOs;
using ResearchLms.Institution.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Institution.Application.Queries;

public record GetInstitutionSettingsQuery(Guid TenantId) : IRequest<Result<InstitutionSettingsDto>>;

public class GetInstitutionSettingsHandler : IRequestHandler<GetInstitutionSettingsQuery, Result<InstitutionSettingsDto>>
{
    private readonly IInstitutionService _service;

    public GetInstitutionSettingsHandler(IInstitutionService service)
    {
        _service = service;
    }

    public async Task<Result<InstitutionSettingsDto>> Handle(GetInstitutionSettingsQuery request, CancellationToken ct)
    {
        return await _service.GetSettingsAsync(request.TenantId, ct);
    }
}
