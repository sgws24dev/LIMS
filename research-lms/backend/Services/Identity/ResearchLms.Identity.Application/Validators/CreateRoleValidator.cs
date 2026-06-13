using FluentValidation;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Domain.Interfaces;

namespace ResearchLms.Identity.Application.Validators;

public class CreateRoleValidator : AbstractValidator<CreateRoleDto>
{
    public CreateRoleValidator(IRoleRepository roleRepository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required")
            .MustAsync(async (name, ct) =>
            {
                var existing = await roleRepository.GetByNameAsync(name, ct);
                return existing is null;
            }).WithMessage("A role with this name already exists");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Role description is required");
    }
}
