using FluentValidation;
using ResearchLms.Compliance.Application.Commands;

namespace ResearchLms.Compliance.Application.Validators;

public class CaptureSignatureValidator : AbstractValidator<CaptureSignatureCommand>
{
    public CaptureSignatureValidator()
    {
        RuleFor(x => x.SignedEntityType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.SignerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SignerEmail).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.SignatureData).NotEmpty();
        RuleFor(x => x.DocumentContext).NotEmpty();
    }
}
