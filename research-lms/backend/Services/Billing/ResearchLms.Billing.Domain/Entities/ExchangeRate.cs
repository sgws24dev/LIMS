using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class ExchangeRate : BaseEntity
{
    public string FromCurrency { get; private set; }
    public string ToCurrency { get; private set; }
    public decimal Rate { get; private set; }
    public DateTime ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }

    private ExchangeRate() { FromCurrency = null!; ToCurrency = null!; }

    public ExchangeRate(string fromCurrency, string toCurrency, decimal rate, DateTime validFrom, DateTime? validTo, string createdBy)
    {
        FromCurrency = fromCurrency.ToUpperInvariant();
        ToCurrency = toCurrency.ToUpperInvariant();
        Rate = rate;
        ValidFrom = validFrom;
        ValidTo = validTo;
        MarkCreated(createdBy);
    }

    public void Update(decimal rate, DateTime validFrom, DateTime? validTo, string modifiedBy)
    {
        Rate = rate;
        ValidFrom = validFrom;
        ValidTo = validTo;
        MarkUpdated(modifiedBy);
    }
}
