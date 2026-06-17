using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class Credit : BaseEntity
{
    public Guid InstitutionId { get; private set; }
    public decimal Balance { get; private set; }
    public string Currency { get; private set; }

    private Credit() { Currency = null!; }

    public Credit(Guid institutionId, decimal initialBalance, string currency, string createdBy)
    {
        InstitutionId = institutionId;
        Balance = initialBalance;
        Currency = currency;
        MarkCreated(createdBy);
    }

    public void AdjustBalance(decimal amount, string modifiedBy)
    {
        Balance += amount;
        MarkUpdated(modifiedBy);
    }
}
