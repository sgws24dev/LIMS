using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record GetFinancialDashboardQuery : IRequest<FinancialDashboardDto>;

public class GetFinancialDashboardQueryHandler : IRequestHandler<GetFinancialDashboardQuery, FinancialDashboardDto>
{
    private readonly IInvoiceRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetFinancialDashboardQueryHandler(IInvoiceRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<FinancialDashboardDto> Handle(GetFinancialDashboardQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var today = now.Date;

        var invoices = await _repository.GetAllAsync(_tenantContext.TenantId, ct);

        var paid = invoices.Where(i => i.Status == InvoiceStatus.Paid);
        var sent = invoices.Where(i => i.Status == InvoiceStatus.Sent);
        var overdue = sent.Where(i => i.DueDate < today);

        var recent = invoices
            .OrderByDescending(i => i.CreatedAt)
            .Take(10)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                Status = i.Status.ToString(),
                BillToName = i.BillToName,
                TotalAmount = i.TotalAmount,
                AmountPaid = i.AmountPaid,
                BalanceDue = i.BalanceDue,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                Currency = i.Currency,
            })
            .ToList();

        var monthlyRevenue = invoices
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt.HasValue)
            .GroupBy(i => new { i.PaidAt!.Value.Year, i.PaidAt.Value.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                CurrentYear = g.Where(i => i.PaidAt!.Value.Year == now.Year).Sum(i => i.TotalAmount),
                PreviousYear = g.Where(i => i.PaidAt!.Value.Year == now.Year - 1).Sum(i => i.TotalAmount),
            })
            .OrderBy(m => m.Month)
            .ToList();

        var revenueByCategory = invoices
            .Where(i => i.Status == InvoiceStatus.Paid)
            .GroupBy(i => i.BilledToEntityType.ToString())
            .Select(g => new CategoryRevenueDto
            {
                Category = g.Key,
                Amount = g.Sum(i => i.TotalAmount),
            })
            .ToList();

        var aging = new List<AgingBucketDto>
        {
            new() { Bucket = "0-30 days", Amount = sent.Where(i => (today - i.DueDate).Days is >= 0 and <= 30).Sum(i => i.BalanceDue) },
            new() { Bucket = "31-60 days", Amount = sent.Where(i => (today - i.DueDate).Days is > 30 and <= 60).Sum(i => i.BalanceDue) },
            new() { Bucket = "61-90 days", Amount = sent.Where(i => (today - i.DueDate).Days is > 60 and <= 90).Sum(i => i.BalanceDue) },
            new() { Bucket = "90+ days", Amount = sent.Where(i => (today - i.DueDate).Days > 90).Sum(i => i.BalanceDue) },
        };

        return new FinancialDashboardDto
        {
            TotalRevenueMonth = paid.Where(i => i.PaidAt >= monthStart).Sum(i => i.TotalAmount),
            OutstandingReceivables = sent.Sum(i => i.BalanceDue),
            OverdueAmount = overdue.Sum(i => i.BalanceDue),
            AvgDaysToPay = (decimal)paid.Where(i => i.PaidAt.HasValue && i.InvoiceDate != default)
                .Select(i => (i.PaidAt!.Value - i.InvoiceDate).TotalDays)
                .DefaultIfEmpty(0)
                .Average(),
            RevenueByMonth = monthlyRevenue,
            RevenueByCategory = revenueByCategory,
            OutstandingByAging = aging,
            RecentTransactions = recent,
        };
    }
}
