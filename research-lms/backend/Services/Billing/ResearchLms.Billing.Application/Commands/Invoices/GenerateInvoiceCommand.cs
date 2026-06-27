using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public record GenerateInvoiceCommand(
    string SourceType,
    Guid SourceId,
    bool PreviewOnly,
    Guid? PricingModelId = null,
    string? CustomerType = null,
    string? Currency = null
) : IRequest<InvoiceDto>;
