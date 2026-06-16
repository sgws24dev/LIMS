using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public enum CalibrationStatus { Valid, Expired, DueSoon, Failed }

public class CalibrationRecord : BaseEntity
{
    public Guid InstrumentId { get; private set; }
    public DateOnly CalibrationDate { get; private set; }
    public DateOnly NextDueDate { get; private set; }
    public string PerformedBy { get; private set; } = string.Empty;
    public string? PerformedByOrganization { get; private set; }
    public string? CertificateRef { get; private set; }
    public CalibrationStatus Status { get; private set; } = CalibrationStatus.Valid;
    public string? Notes { get; private set; }

    public Instrument? Instrument { get; private set; }

    private CalibrationRecord() : base() { }

    public CalibrationRecord(
        Guid instrumentId, DateOnly calibrationDate, DateOnly nextDueDate,
        string performedBy, string? performedByOrganization,
        string? certificateRef, string? notes)
    {
        InstrumentId = instrumentId;
        CalibrationDate = calibrationDate;
        NextDueDate = nextDueDate;
        PerformedBy = performedBy;
        PerformedByOrganization = performedByOrganization;
        CertificateRef = certificateRef;
        Notes = notes;
        Status = CalibrationStatus.Valid;
    }

    public void Update(DateOnly calibrationDate, DateOnly nextDueDate,
        string performedBy, string? performedByOrganization,
        string? certificateRef, string? notes)
    {
        CalibrationDate = calibrationDate;
        NextDueDate = nextDueDate;
        PerformedBy = performedBy;
        PerformedByOrganization = performedByOrganization;
        CertificateRef = certificateRef;
        Notes = notes;
    }

    public void SetStatus(CalibrationStatus status) => Status = status;
}
