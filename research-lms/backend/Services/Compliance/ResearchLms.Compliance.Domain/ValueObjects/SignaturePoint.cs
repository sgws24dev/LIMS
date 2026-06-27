using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Domain.ValueObjects;

public class SignaturePoint : ValueObject
{
    public int X { get; }
    public int Y { get; }
    public float? Pressure { get; }
    public long? Timestamp { get; }

    public SignaturePoint(int x, int y, float? pressure, long? timestamp)
    {
        X = x; Y = y; Pressure = pressure; Timestamp = timestamp;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return X; yield return Y; yield return Pressure ?? 0; yield return Timestamp ?? 0;
    }
}
