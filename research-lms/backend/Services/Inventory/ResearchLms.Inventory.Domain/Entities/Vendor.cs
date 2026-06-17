using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Inventory.Domain.Entities;

public class Vendor : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? ContactPerson { get; private set; }
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Address { get; private set; }
    public string? Website { get; private set; }
    public VendorStatus Status { get; private set; }
    public PaymentTerms PaymentTerms { get; private set; }
    public string? TaxId { get; private set; }
    public string? Notes { get; private set; }
    public int? Rating { get; private set; }
    public int LeadTimeDays { get; private set; }
    public int TotalOrdersCount { get; private set; }
    public decimal TotalOrdersValue { get; private set; }

    public bool IsActive => Status == VendorStatus.Active;

    private readonly List<PurchaseOrder> _purchaseOrders = new();
    public IReadOnlyCollection<PurchaseOrder> PurchaseOrders => _purchaseOrders.AsReadOnly();

    private Vendor() { Code = null!; Name = null!; }

    public Vendor(
        string name,
        string code,
        string? contactPerson,
        string? email,
        string? phone,
        string? address,
        int leadTimeDays = 0)
    {
        Name = name;
        Code = code;
        ContactPerson = contactPerson;
        Email = email;
        Phone = phone;
        Address = address;
        LeadTimeDays = leadTimeDays;
        Status = VendorStatus.Active;
        PaymentTerms = PaymentTerms.Net30;
    }

    public void Update(
        string name,
        string? contactPerson,
        string? email,
        string? phone,
        string? address,
        int leadTimeDays,
        bool isActive)
    {
        Name = name;
        ContactPerson = contactPerson;
        Email = email;
        Phone = phone;
        Address = address;
        LeadTimeDays = leadTimeDays;
        Status = isActive ? VendorStatus.Active : VendorStatus.Inactive;
    }

    public void Deactivate() => Status = VendorStatus.Inactive;
    public void Activate() => Status = VendorStatus.Active;
}
