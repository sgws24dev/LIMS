using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services;

public class PricingService : IPricingService
{
    private readonly IRateTableRepository _rateTableRepository;
    private readonly IRebateService _rebateService;
    private readonly ITaxService _taxService;

    public PricingService(
        IRateTableRepository rateTableRepository,
        IRebateService rebateService,
        ITaxService taxService)
    {
        _rateTableRepository = rateTableRepository;
        _rebateService = rebateService;
        _taxService = taxService;
    }

    public async Task<PriceBreakdown> CalculatePriceAsync(
        Guid pricingModelId,
        decimal quantity,
        int? duration,
        string customerType,
        Dictionary<string, object>? context = null,
        CancellationToken ct = default)
    {
        if (!Enum.TryParse<CustomerType>(customerType, true, out var custType))
            throw new ArgumentException($"Invalid customer type: {customerType}");

        var rateTables = await _rateTableRepository.GetByPricingModelIdAsync(pricingModelId, ct);
        var applicableRate = rateTables
            .Where(r => r.CustomerType == custType)
            .Where(r => r.EffectiveFrom <= DateTime.UtcNow)
            .Where(r => r.EffectiveTo == null || r.EffectiveTo >= DateTime.UtcNow)
            .OrderBy(r => r.MinQuantity ?? 0)
            .ToList();

        var rate = applicableRate.FirstOrDefault();
        var unitPrice = rate?.Rate ?? 0;

        var lineItems = new List<PriceLineItem>();
        var effectiveQuantity = duration.HasValue ? quantity * duration.Value : quantity;
        var subtotal = unitPrice * effectiveQuantity;

        var discount = await _rebateService.CalculateRebateAsync(subtotal, null, ct);
        var afterDiscount = subtotal - discount;

        var country = context?.GetValueOrDefault("country") as string ?? "AE";
        var region = context?.GetValueOrDefault("region") as string;
        var taxAmount = await _taxService.CalculateTaxAsync(country, region, afterDiscount, ct);

        var lineTotal = afterDiscount + taxAmount;

        lineItems.Add(new PriceLineItem(
            $"Pricing Model ({pricingModelId})",
            effectiveQuantity,
            unitPrice,
            subtotal > 0 ? (discount / subtotal * 100) : 0,
            afterDiscount > 0 ? (taxAmount / afterDiscount * 100) : 0,
            lineTotal));

        return new PriceBreakdown(subtotal, discount, taxAmount, lineTotal, lineItems);
    }
}
