namespace ResearchLms.Inventory.Domain.Interfaces;

public interface IBarcodeScanService
{
    Task<string?> DecodeBarcodeAsync(Stream imageStream, CancellationToken ct = default);
    string GenerateBarcode(string data);
}
