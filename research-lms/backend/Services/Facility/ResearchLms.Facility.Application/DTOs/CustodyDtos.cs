namespace ResearchLms.Facilities.Application.DTOs;

public record CustodyEventDto(
    Guid Id, Guid AssetId, string? AssetName, string? FromUserName, string ToUserName,
    string? FromLocation, string ToLocation, DateTime TransferredAt,
    string? Reason, bool HasSignature, string? Notes);

public record CustodyEventDetailDto(
    Guid Id, Guid AssetId, string? AssetName, string? FromUserName, string ToUserName,
    string? FromLocation, string ToLocation, DateTime TransferredAt,
    string? Reason, string? SignatureRef, string? Notes);

public record TransferAssetCustodyRequest(
    Guid AssetId, string ToUserId, string ToUserName, string ToLocation,
    string? Reason, string? SignatureData, string? Notes);
