using MediatR;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public record CreateExchangeRateCommand(
    string FromCurrency,
    string ToCurrency,
    decimal Rate,
    DateTime ValidFrom,
    DateTime? ValidTo
) : IRequest;
