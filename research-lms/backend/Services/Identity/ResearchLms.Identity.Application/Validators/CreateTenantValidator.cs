using System.Text.RegularExpressions;
using FluentValidation;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Domain.Interfaces;

namespace ResearchLms.Identity.Application.Validators;

public partial class CreateTenantValidator : AbstractValidator<CreateTenantDto>
{
    [GeneratedRegex("^[a-zA-Z0-9]+$")]
    private static partial Regex AlphanumericRegex();

    public CreateTenantValidator(ITenantRepository tenantRepository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant name is required");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Tenant code is required")
            .Matches(AlphanumericRegex()).WithMessage("Tenant code must be alphanumeric")
            .MustAsync(async (code, ct) => !await tenantRepository.ExistsAsync(code, ct))
                .WithMessage("A tenant with this code already exists");

        RuleFor(x => x.Domain)
            .Must(BeValidDomain).When(x => !string.IsNullOrWhiteSpace(x.Domain))
                .WithMessage("Domain must be a valid domain format");
    }

    private static bool BeValidDomain(string? domain)
    {
        if (string.IsNullOrWhiteSpace(domain))
            return true;

        return Uri.TryCreate($"https://{domain}", UriKind.Absolute, out var uri)
            && (uri.Host == domain);
    }
}
