using FluentValidation;
using ResearchLms.Facilities.Application.Commands;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Validators;

public class CreateMaintenanceRecordCommandValidator : AbstractValidator<CreateMaintenanceRecordCommand>
{
    public CreateMaintenanceRecordCommandValidator()
    {
        RuleFor(x => x.Data.AssetId).NotEmpty().WithMessage("Asset is required");
        RuleFor(x => x.Data.Type).NotEmpty().WithMessage("Maintenance type is required")
            .Must(v => Enum.TryParse<MaintenanceType>(v, out _)).WithMessage("Invalid maintenance type");
        RuleFor(x => x.Data.ScheduledDate).NotEmpty().WithMessage("Scheduled date is required");
    }
}

public class CreateWorkOrderCommandValidator : AbstractValidator<CreateWorkOrderCommand>
{
    public CreateWorkOrderCommandValidator()
    {
        RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(300);
        RuleFor(x => x.MaintenanceRecordId).NotEmpty().WithMessage("Maintenance record is required");
        RuleFor(x => x.Data.Priority).NotEmpty().Must(v => Enum.TryParse<WorkOrderPriority>(v, out _))
            .WithMessage("Invalid priority");
    }
}

public class UpdateWorkOrderCommandValidator : AbstractValidator<UpdateWorkOrderCommand>
{
    public UpdateWorkOrderCommandValidator()
    {
        RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(300);
    }
}
