using MediatR;
using ResearchLms.Institution.Application.DTOs;
using ResearchLms.Institution.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Institution.Application.Commands;

public record UpdateInstitutionSettingsCommand(Guid TenantId, UpdateInstitutionSettingsDto Dto) : IRequest<Result<InstitutionSettingsDto>>;

public class UpdateInstitutionSettingsHandler : IRequestHandler<UpdateInstitutionSettingsCommand, Result<InstitutionSettingsDto>>
{
    private readonly IInstitutionService _service;

    public UpdateInstitutionSettingsHandler(IInstitutionService service)
    {
        _service = service;
    }

    public async Task<Result<InstitutionSettingsDto>> Handle(UpdateInstitutionSettingsCommand request, CancellationToken ct)
    {
        return await _service.UpdateSettingsAsync(request.TenantId, request.Dto, ct);
    }
}
