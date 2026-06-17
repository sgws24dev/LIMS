using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public class CreateServiceRequestCommandHandler : IRequestHandler<CreateServiceRequestCommand, ApiResponse<ServiceRequestDto>>
{
    private readonly IServiceRequestRepository _repository;
    private readonly IFormDefinitionRepository _formRepository;
    private readonly IFormSchemaValidator _schemaValidator;

    public CreateServiceRequestCommandHandler(
        IServiceRequestRepository repository,
        IFormDefinitionRepository formRepository,
        IFormSchemaValidator schemaValidator)
    {
        _repository = repository;
        _formRepository = formRepository;
        _schemaValidator = schemaValidator;
    }

    public async Task<ApiResponse<ServiceRequestDto>> Handle(CreateServiceRequestCommand request, CancellationToken ct)
    {
        var form = await _formRepository.GetByIdAsync(request.FormDefinitionId, ct)
            ?? throw new Domain.Exceptions.NotFoundException(nameof(FormDefinition), request.FormDefinitionId);

        if (!Enum.TryParse<ApprovalRoutingType>(request.ApprovalRouting, true, out var routing))
            throw new ArgumentException($"Invalid approval routing: {request.ApprovalRouting}");

        var validation = _schemaValidator.Validate(form.Schema, request.FormData);
        if (!validation.IsValid)
            throw new Domain.Exceptions.FormValidationException("Form data validation failed.",
                validation.Errors!.Select(e => new Domain.Exceptions.FieldError(e.Field, e.Message)));

        if (!Enum.TryParse<Priority>(request.Priority, true, out var priority))
            throw new ArgumentException($"Invalid priority: {request.Priority}");

        var serviceRequest = new ServiceRequest(
            form.Id,
            form.Version,
            request.Title,
            request.Description,
            request.FormData,
            routing,
            priority,
            request.DueDate,
            request.CreatedBy);

        await _repository.AddAsync(serviceRequest, ct);

        return new ApiResponse<ServiceRequestDto>(true, MapToDto(serviceRequest, form.Title));
    }

    private static ServiceRequestDto MapToDto(ServiceRequest sr, string formTitle) => new(
        sr.Id, sr.FormDefinitionId, sr.FormDefinitionVersion, formTitle,
        sr.Title, sr.Description, sr.Status.ToString(), sr.Priority.ToString(),
        sr.FormData, sr.AssignedTo, sr.SubmittedAt, sr.SubmittedBy,
        sr.DueDate, sr.CompletedAt, sr.CompletedBy,
        sr.ApprovalRouting.ToString(), sr.CreatedAt, sr.CreatedBy
    );
}
