using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Domain.ValueObjects;

public class HashChainResult : ValueObject
{
    public bool IsIntact { get; }
    public string? TamperedEntryId { get; }
    public string? ComputedHash { get; }
    public string? StoredHash { get; }

    public HashChainResult(bool isIntact, string? tamperedEntryId = null, string? computedHash = null, string? storedHash = null)
    {
        IsIntact = isIntact;
        TamperedEntryId = tamperedEntryId;
        ComputedHash = computedHash;
        StoredHash = storedHash;
    }

    public static HashChainResult Intact() => new(true);
    public static HashChainResult Tampered(string entryId, string computed, string stored) =>
        new(false, entryId, computed, stored);

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return IsIntact;
        yield return TamperedEntryId ?? "";
        yield return ComputedHash ?? "";
        yield return StoredHash ?? "";
    }
}
