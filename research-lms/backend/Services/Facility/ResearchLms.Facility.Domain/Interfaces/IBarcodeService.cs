namespace ResearchLms.Facilities.Domain.Interfaces;

public interface IBarcodeService
{
    byte[] GenerateQrCode(string payload, int pixelsPerModule = 10);
    byte[] GenerateAssetLabel(string assetId, string assetName, string identifier, string? location);
}
