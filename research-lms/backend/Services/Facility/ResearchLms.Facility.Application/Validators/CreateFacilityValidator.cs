using FluentValidation;
using ResearchLms.Facilities.Application.DTOs;

namespace ResearchLms.Facilities.Application.Validators;

public class CreateFacilityValidator : AbstractValidator<CreateFacilityDto>
{
    public CreateFacilityValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).NotEmpty().Must(t => new[] { "core_facility", "research_lab", "teaching_lab", "biosafety_lab" }.Contains(t))
            .WithMessage("Type must be one of: core_facility, research_lab, teaching_lab, biosafety_lab");
        RuleFor(x => x.Location).MaximumLength(500);
    }
}

public class UpdateFacilityValidator : AbstractValidator<UpdateFacilityDto>
{
    public UpdateFacilityValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).NotEmpty().Must(t => new[] { "core_facility", "research_lab", "teaching_lab", "biosafety_lab" }.Contains(t))
            .WithMessage("Type must be one of: core_facility, research_lab, teaching_lab, biosafety_lab");
        RuleFor(x => x.Location).MaximumLength(500);
    }
}
