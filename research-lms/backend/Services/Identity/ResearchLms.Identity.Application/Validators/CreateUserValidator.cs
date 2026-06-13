using FluentValidation;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Domain.Interfaces;

namespace ResearchLms.Identity.Application.Validators;

public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserValidator(IUserRepository userRepository)
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MustAsync(async (email, ct) => !await userRepository.ExistsAsync(email, ct))
                .WithMessage("A user with this email already exists");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Must(p => p.Any(char.IsUpper)).WithMessage("Password must contain at least one uppercase letter")
            .Must(p => p.Any(char.IsDigit)).WithMessage("Password must contain at least one digit");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required");
    }
}
