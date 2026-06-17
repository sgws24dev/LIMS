using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class InvoiceSequence : BaseEntity
{
    public int Year { get; private set; }
    public int LastSequence { get; private set; }

    private InvoiceSequence() { }

    public InvoiceSequence(Guid tenantId, int year)
    {
        SetTenant(tenantId);
        Year = year;
        LastSequence = 0;
    }

    public int GetNextSequence()
    {
        LastSequence++;
        return LastSequence;
    }
}
