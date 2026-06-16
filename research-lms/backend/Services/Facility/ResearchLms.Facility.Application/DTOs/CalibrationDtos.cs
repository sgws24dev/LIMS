namespace ResearchLms.Facilities.Application.DTOs;

public record CalibrationRecordDto(
    Guid Id, Guid InstrumentId, string? InstrumentName, DateOnly CalibrationDate,
    DateOnly NextDueDate, string PerformedBy, string? PerformedByOrganization,
    string? CertificateRef, string Status, string? Notes);

public record CalibrationDueSummaryDto(
    int DueSoonCount, int ExpiredCount, int ValidCount, int TotalCount);

public record CreateCalibrationRecordRequest(
    Guid InstrumentId, DateOnly CalibrationDate, DateOnly NextDueDate,
    string PerformedBy, string? PerformedByOrganization,
    string? CertificateRef, string? Notes);

public record UpdateCalibrationRecordRequest(
    DateOnly CalibrationDate, DateOnly NextDueDate,
    string PerformedBy, string? PerformedByOrganization,
    string? CertificateRef, string? Notes);
