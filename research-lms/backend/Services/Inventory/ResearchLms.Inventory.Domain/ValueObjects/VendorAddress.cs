namespace ResearchLms.Inventory.Domain.ValueObjects;

public record VendorAddress(
    string? Street,
    string? City,
    string? State,
    string? Zip,
    string? Country
);
