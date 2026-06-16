using ResearchLms.Facilities.Domain.Interfaces;
using QRCoder;

namespace ResearchLms.Facilities.Infrastructure.Services;

public class BarcodeService : IBarcodeService
{
    public byte[] GenerateQrCode(string payload, int pixelsPerModule = 10)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrData);
        return qrCode.GetGraphic(pixelsPerModule);
    }

    public byte[] GenerateAssetLabel(string assetId, string assetName, string identifier, string? location)
    {
        var payload = $"https://app.researchlms.com/facility/assets/{assetId}";
        return GenerateQrCode(payload, 8);
    }
}
