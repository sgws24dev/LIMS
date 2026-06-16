using FluentValidation;
using ResearchLms.Facilities.Application.Commands;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Application.Validators;

public class CreateAssetCommandValidator : AbstractValidator<CreateAssetCommand>
{
    public CreateAssetCommandValidator()
    {
        RuleFor(x => x.Data.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200);

        RuleFor(x => x.Data.Identifier)
            .NotEmpty().WithMessage("Identifier is required")
            .MaximumLength(100);

        RuleFor(x => x.Data.FacilityId)
            .NotEmpty().WithMessage("Facility is required");

        RuleFor(x => x.Data.Category)
            .NotEmpty().WithMessage("Category is required");

        RuleFor(x => x.Data.AcquisitionCost)
            .GreaterThanOrEqualTo(0).When(x => x.Data.AcquisitionCost.HasValue);

        RuleFor(x => x.Data.UsefulLifeYears)
            .GreaterThan(0).When(x => x.Data.UsefulLifeYears.HasValue);

        RuleFor(x => x.Data.Port)
            .InclusiveBetween(1, 65535).When(x => x.Data.IotEnabled);

        When(x => x.Data.ConnectionProtocol is not null, () =>
        {
            RuleFor(x => x.Data.ConnectionProtocol)
                .Must(v => Enum.TryParse<ConnectionProtocol>(v, out _))
                .WithMessage("Invalid connection protocol");
        });

        When(x => x.Data.DepreciationMethod is not null, () =>
        {
            RuleFor(x => x.Data.DepreciationMethod)
                .Must(v => Enum.TryParse<DepreciationMethod>(v, out _))
                .WithMessage("Invalid depreciation method");
        });
    }
}

public class UpdateAssetCommandValidator : AbstractValidator<UpdateAssetCommand>
{
    public UpdateAssetCommandValidator()
    {
        RuleFor(x => x.Data.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200);

        RuleFor(x => x.Data.AcquisitionCost)
            .GreaterThanOrEqualTo(0).When(x => x.Data.AcquisitionCost.HasValue);

        RuleFor(x => x.Data.UsefulLifeYears)
            .GreaterThan(0).When(x => x.Data.UsefulLifeYears.HasValue);

        RuleFor(x => x.Data.Port)
            .InclusiveBetween(1, 65535).When(x => x.Data.IotEnabled);
    }
}
