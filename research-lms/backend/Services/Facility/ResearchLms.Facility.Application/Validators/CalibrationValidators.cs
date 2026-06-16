using FluentValidation;
using ResearchLms.Facilities.Application.Commands;

namespace ResearchLms.Facilities.Application.Validators;

public class CreateCalibrationRecordCommandValidator : AbstractValidator<CreateCalibrationRecordCommand>
{
    public CreateCalibrationRecordCommandValidator()
    {
        RuleFor(x => x.Data.InstrumentId).NotEmpty().WithMessage("Instrument is required");
        RuleFor(x => x.Data.CalibrationDate).NotEmpty().WithMessage("Calibration date is required");
        RuleFor(x => x.Data.NextDueDate)
            .GreaterThan(x => x.Data.CalibrationDate)
            .WithMessage("Next due date must be after calibration date");
        RuleFor(x => x.Data.PerformedBy).NotEmpty().WithMessage("Performed by is required").MaximumLength(200);
    }
}

public class UpdateCalibrationRecordCommandValidator : AbstractValidator<UpdateCalibrationRecordCommand>
{
    public UpdateCalibrationRecordCommandValidator()
    {
        RuleFor(x => x.Data.CalibrationDate).NotEmpty();
        RuleFor(x => x.Data.NextDueDate)
            .GreaterThan(x => x.Data.CalibrationDate)
            .WithMessage("Next due date must be after calibration date");
        RuleFor(x => x.Data.PerformedBy).NotEmpty().MaximumLength(200);
    }
}
