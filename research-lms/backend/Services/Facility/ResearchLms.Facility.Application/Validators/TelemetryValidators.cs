using FluentValidation;
using ResearchLms.Facilities.Application.Commands;

namespace ResearchLms.Facilities.Application.Validators;

public class IngestTelemetryCommandValidator : AbstractValidator<IngestTelemetryCommand>
{
    public IngestTelemetryCommandValidator()
    {
        RuleFor(x => x.Data.InstrumentId).NotEmpty().WithMessage("Instrument is required");
        RuleFor(x => x.Data.Timestamp)
            .NotEmpty().WithMessage("Timestamp is required")
            .LessThanOrEqualTo(DateTime.UtcNow.AddMinutes(1))
            .WithMessage("Timestamp cannot be in the future");
        RuleFor(x => x.Data.Metrics)
            .NotNull().WithMessage("Metrics are required")
            .NotEmpty().WithMessage("At least one metric is required");
    }
}

public class IngestTelemetryBatchCommandValidator : AbstractValidator<IngestTelemetryBatchCommand>
{
    public IngestTelemetryBatchCommandValidator()
    {
        RuleFor(x => x.Data.Records)
            .NotNull().WithMessage("Records are required")
            .NotEmpty().WithMessage("At least one record is required");
    }
}
