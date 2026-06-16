using FluentValidation;
using ResearchLms.Facilities.Application.Commands;

namespace ResearchLms.Facilities.Application.Validators;

public class TransferAssetCustodyCommandValidator : AbstractValidator<TransferAssetCustodyCommand>
{
    public TransferAssetCustodyCommandValidator()
    {
        RuleFor(x => x.Data.AssetId).NotEmpty().WithMessage("Asset is required");
        RuleFor(x => x.Data.ToUserId).NotEmpty().WithMessage("Recipient is required");
        RuleFor(x => x.Data.ToUserName).NotEmpty().WithMessage("Recipient name is required").MaximumLength(200);
        RuleFor(x => x.Data.ToLocation).NotEmpty().WithMessage("Destination location is required").MaximumLength(300);
        RuleFor(x => x.Data.Reason).MaximumLength(1000);
        RuleFor(x => x.Data.Notes).MaximumLength(1000);
        When(x => x.Data.SignatureData is not null, () =>
        {
            RuleFor(x => x.Data.SignatureData!)
                .Must(s => s.StartsWith("data:image/"))
                .WithMessage("Signature must be a valid base64 data URI starting with 'data:image/'");
        });
    }
}
