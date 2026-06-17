using ResearchLms.Inventory.Domain.Interfaces;
using ZXing;
using ZXing.Common;
using ZXing.Rendering;

namespace ResearchLms.Inventory.Infrastructure.Services;

public class BarcodeScanService : IBarcodeScanService
{
    public Task<string?> DecodeBarcodeAsync(Stream imageStream, CancellationToken ct = default)
    {
        throw new NotImplementedException("Barcode decoding requires System.Drawing.Common or SkiaSharp bindings.");
    }

    public string GenerateBarcode(string data)
    {
        var writer = new BarcodeWriter<SvgRenderer.SvgImage>
        {
            Format = BarcodeFormat.CODE_128,
            Options = new EncodingOptions
            {
                Height = 100,
                Width = 300,
                Margin = 10
            },
            Renderer = new SvgRenderer()
        };

        var svgImage = writer.Write(data);
        return svgImage.Content;
    }
}
