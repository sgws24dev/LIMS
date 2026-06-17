namespace ResearchLms.Inventory.Domain.ValueObjects;

public record Money(decimal Amount, string Currency = "AED")
{
    public static Money Zero => new(0);

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add {other.Currency} to {Currency}");
        return this with { Amount = Amount + other.Amount };
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot subtract {other.Currency} from {Currency}");
        return this with { Amount = Amount - other.Amount };
    }

    public Money MultiplyBy(decimal factor) => this with { Amount = Amount * factor };
}
