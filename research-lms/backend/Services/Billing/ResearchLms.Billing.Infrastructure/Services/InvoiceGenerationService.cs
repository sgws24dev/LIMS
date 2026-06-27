using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Services;

public class InvoiceGenerationService : IInvoiceGenerationService
{
    private readonly IInvoiceRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly IPricingService _pricingService;
    private readonly ICurrencyService _currencyService;

    public InvoiceGenerationService(
        IInvoiceRepository repository,
        ITenantContext tenantContext,
        IPricingService pricingService,
        ICurrencyService currencyService)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _pricingService = pricingService;
        _currencyService = currencyService;
    }

    public async Task<Invoice> GenerateFromServiceRequestAsync(Guid serviceRequestId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default)
    {
        var invoice = await CreateDraftInvoiceAsync(
            BilledToEntityType.ServiceRequest,
            serviceRequestId,
            "Service Request Bill",
            "N/A",
            "billing@researchlms.local",
            "AED",
            createdBy,
            ct);

        if (pricingModelId.HasValue)
            await ApplyPricingAsync(invoice, pricingModelId.Value, 1, null, customerType, "AE", createdBy, ct);
        else
            invoice.AddLineItem(new InvoiceLineItem(
                invoice.Id, $"Service Request {serviceRequestId}",
                1, 0, 0, 0, "ServiceRequest", serviceRequestId, createdBy));

        await _repository.AddAsync(invoice, ct);
        return invoice;
    }

    public async Task<Invoice> GenerateFromBookingAsync(Guid bookingId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default)
    {
        var invoice = await CreateDraftInvoiceAsync(
            BilledToEntityType.Booking,
            bookingId,
            "Booking Invoice",
            "N/A",
            "billing@researchlms.local",
            "AED",
            createdBy,
            ct);

        if (pricingModelId.HasValue)
            await ApplyPricingAsync(invoice, pricingModelId.Value, 1, null, customerType, "AE", createdBy, ct);
        else
            invoice.AddLineItem(new InvoiceLineItem(
                invoice.Id, $"Booking {bookingId}",
                1, 0, 0, 0, "Booking", bookingId, createdBy));

        await _repository.AddAsync(invoice, ct);
        return invoice;
    }

    public async Task<Invoice> GenerateManualAsync(
        string billToName,
        string billToAddress,
        string billToEmail,
        List<(string description, decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxRate, string? referenceType, Guid? referenceId)> lineItems,
        string createdBy,
        CancellationToken ct = default)
    {
        var invoice = await CreateDraftInvoiceAsync(
            BilledToEntityType.Monthly,
            null,
            billToName,
            billToAddress,
            billToEmail,
            "AED",
            createdBy,
            ct);

        foreach (var item in lineItems)
        {
            invoice.AddLineItem(new InvoiceLineItem(
                invoice.Id,
                item.description,
                item.quantity,
                item.unitPrice,
                item.discountPercent,
                item.taxRate,
                item.referenceType,
                item.referenceId,
                createdBy));
        }

        await _repository.AddAsync(invoice, ct);
        return invoice;
    }

    public async Task<Invoice> GeneratePricedManualAsync(
        string billToName,
        string billToAddress,
        string billToEmail,
        string currency,
        Guid? pricingModelId,
        string customerType,
        decimal quantity,
        int? duration,
        string createdBy,
        CancellationToken ct = default)
    {
        var invoice = await CreateDraftInvoiceAsync(
            BilledToEntityType.Monthly,
            null,
            billToName,
            billToAddress,
            billToEmail,
            currency,
            createdBy,
            ct);

        if (pricingModelId.HasValue)
            await ApplyPricingAsync(invoice, pricingModelId.Value, quantity, duration, customerType, "AE", createdBy, ct);

        if (currency != "AED")
        {
            var converted = await _currencyService.ConvertAsync(invoice.TotalAmount, "AED", currency, ct);
            invoice.RecalculateForCurrency(converted, currency);
        }

        await _repository.AddAsync(invoice, ct);
        return invoice;
    }

    public async Task<Invoice> PreviewFromServiceRequestAsync(Guid serviceRequestId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default)
    {
        return await GenerateFromServiceRequestAsync(serviceRequestId, pricingModelId, customerType, createdBy, ct);
    }

    public async Task<Invoice> PreviewFromBookingAsync(Guid bookingId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default)
    {
        return await GenerateFromBookingAsync(bookingId, pricingModelId, customerType, createdBy, ct);
    }

    private async Task ApplyPricingAsync(Invoice invoice, Guid pricingModelId, decimal quantity, int? duration, string customerType, string country, string createdBy, CancellationToken ct)
    {
        var context = new Dictionary<string, object> { ["country"] = country };
        var price = await _pricingService.CalculatePriceAsync(pricingModelId, quantity, duration, customerType, context, ct);

        invoice.ClearLineItems();
        foreach (var item in price.LineItems)
        {
            invoice.AddLineItem(new InvoiceLineItem(
                invoice.Id,
                item.Description,
                item.Quantity,
                item.UnitPrice,
                item.DiscountPercent,
                item.TaxRate,
                null, null,
                createdBy));
        }

        invoice.RecalculateTotals();
    }

    private async Task<Invoice> CreateDraftInvoiceAsync(
        BilledToEntityType entityType,
        Guid? entityId,
        string billToName,
        string billToAddress,
        string billToEmail,
        string currency,
        string createdBy,
        CancellationToken ct)
    {
        var tenantId = _tenantContext.TenantId;
        var year = DateTime.UtcNow.Year;

        var sequence = await _repository.GetSequenceAsync(tenantId, year, ct);
        if (sequence == null)
        {
            sequence = new InvoiceSequence(tenantId, year);
            await _repository.AddSequenceAsync(sequence, ct);
        }

        var seqNumber = sequence.GetNextSequence();
        await _repository.UpdateSequenceAsync(sequence, ct);

        var invoiceNumber = $"INV-{year}-{seqNumber:D6}";

        return new Invoice(
            invoiceNumber,
            entityType,
            entityId,
            billToName,
            billToAddress,
            billToEmail,
            currency,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            createdBy);
    }
}
