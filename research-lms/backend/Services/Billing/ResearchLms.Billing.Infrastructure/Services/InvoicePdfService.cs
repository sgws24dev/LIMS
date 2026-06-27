using Microsoft.Extensions.Caching.Memory;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Infrastructure.Services;

public class InvoicePdfService : IInvoicePdfService
{
    private readonly IInvoiceRepository _repository;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

    public InvoicePdfService(IInvoiceRepository repository, IMemoryCache cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<byte[]> GeneratePdfAsync(Guid invoiceId, CancellationToken ct = default)
    {
        var cacheKey = await GetPdfCacheKeyAsync(invoiceId);

        if (_cache.TryGetValue(cacheKey, out byte[]? cached) && cached != null)
            return cached;

        var invoice = await _repository.GetByIdAsync(invoiceId, ct)
            ?? throw new KeyNotFoundException($"Invoice {invoiceId} not found.");

        var pdfBytes = BuildPdf(invoice);

        _cache.Set(cacheKey, pdfBytes, CacheDuration);

        return pdfBytes;
    }

    public Task<string> GetPdfCacheKeyAsync(Guid invoiceId)
    {
        return Task.FromResult($"invoice-pdf-{invoiceId}");
    }

    private static byte[] BuildPdf(Invoice invoice)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);

                page.Header().Element(c => ComposeHeader(c, invoice));
                page.Content().Element(c => ComposeContent(c, invoice));
                page.Footer().Element(ComposeFooter);
            });
        }).GeneratePdf();
    }

    private static void ComposeHeader(IContainer container, Invoice invoice)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("RESEARCH LMS").Bold().FontSize(20).FontColor(Colors.Blue.Medium);
                    c.Item().Text("Billing Department").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                row.ConstantItem(200).AlignRight().Column(c =>
                {
                    c.Item().Text($"INVOICE").Bold().FontSize(24).FontColor(Colors.Black);
                    c.Item().Text(invoice.InvoiceNumber).FontSize(14).FontColor(Colors.Grey.Darken2);
                });
            });

            column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
        });
    }

    private static void ComposeContent(IContainer container, Invoice invoice)
    {
        container.Column(column =>
        {
            column.Spacing(15);

            column.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Bill To:").SemiBold().FontSize(11);
                    c.Item().PaddingTop(4).Text(invoice.BillToName).FontSize(10);
                    c.Item().Text(invoice.BillToAddress).FontSize(10);
                    c.Item().Text(invoice.BillToEmail).FontSize(10);
                });

                row.ConstantItem(220).Column(c =>
                {
                    c.Item().Text($"Invoice Date: {invoice.InvoiceDate:dd MMM yyyy}").FontSize(10);
                    c.Item().Text($"Due Date: {invoice.DueDate:dd MMM yyyy}").FontSize(10);
                    c.Item().Text($"Status: {invoice.Status}").FontSize(10);
                    c.Item().Text($"Currency: {invoice.Currency}").FontSize(10);
                });
            });

            column.Item().PaddingVertical(5).Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    cols.RelativeColumn(3);
                    cols.ConstantColumn(50);
                    cols.ConstantColumn(70);
                    cols.ConstantColumn(50);
                    cols.ConstantColumn(50);
                    cols.ConstantColumn(70);
                });

                table.Header(header =>
                {
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(6).Text("Description").SemiBold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Qty").SemiBold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Unit Price").SemiBold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Disc %").SemiBold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Tax %").SemiBold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Total").SemiBold().FontSize(9);
                });

                foreach (var item in invoice.LineItems)
                {
                    table.Cell().Padding(4).Text(item.Description).FontSize(9);
                    table.Cell().Padding(4).AlignRight().Text(item.Quantity.ToString()).FontSize(9);
                    table.Cell().Padding(4).AlignRight().Text($"{item.UnitPrice:F2}").FontSize(9);
                    table.Cell().Padding(4).AlignRight().Text($"{item.DiscountPercent}%").FontSize(9);
                    table.Cell().Padding(4).AlignRight().Text($"{item.TaxRate}%").FontSize(9);
                    table.Cell().Padding(4).AlignRight().Text($"{item.LineTotal:F2}").FontSize(9);
                }
            });

            column.Item().AlignRight().Column(totals =>
            {
                totals.Spacing(3);
                totals.Item().Width(200).Row(r =>
                {
                    r.RelativeItem().Text("Subtotal:").FontSize(10);
                    r.ConstantItem(80).AlignRight().Text($"{invoice.Subtotal:F2}").FontSize(10);
                });
                totals.Item().Width(200).Row(r =>
                {
                    r.RelativeItem().Text("Discount:").FontSize(10);
                    r.ConstantItem(80).AlignRight().Text($"({invoice.DiscountAmount:F2})").FontSize(10);
                });
                totals.Item().Width(200).Row(r =>
                {
                    r.RelativeItem().Text("Tax:").FontSize(10);
                    r.ConstantItem(80).AlignRight().Text($"{invoice.TaxAmount:F2}").FontSize(10);
                });
                totals.Item().PaddingVertical(3).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                totals.Item().Width(200).Row(r =>
                {
                    r.RelativeItem().Text("Total:").SemiBold().FontSize(14);
                    r.ConstantItem(80).AlignRight().Text($"{invoice.TotalAmount:F2}").SemiBold().FontSize(14);
                });
                totals.Item().Width(200).Row(r =>
                {
                    r.RelativeItem().Text("Paid:").FontSize(10);
                    r.ConstantItem(80).AlignRight().Text($"({invoice.AmountPaid:F2})").FontSize(10);
                });
                totals.Item().Width(200).Row(r =>
                {
                    r.RelativeItem().Text("Balance Due:").SemiBold().FontSize(11);
                    r.ConstantItem(80).AlignRight().Text($"{invoice.BalanceDue:F2}").SemiBold().FontSize(11);
                });
            });
        });
    }

    private static void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Column(c =>
        {
            c.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
            c.Item().PaddingTop(5).Text("Research LMS — Billing System").FontSize(9).FontColor(Colors.Grey.Medium);
            c.Item().Text("Payment Terms: Net 30 days").FontSize(9).FontColor(Colors.Grey.Medium);
        });
    }
}
