using MediatR;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public class CreateExchangeRateCommandHandler : IRequestHandler<CreateExchangeRateCommand>
{
    private readonly IExchangeRateRepository _repository;

    public CreateExchangeRateCommandHandler(IExchangeRateRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(CreateExchangeRateCommand request, CancellationToken ct)
    {
        var entity = new ExchangeRate(
            request.FromCurrency,
            request.ToCurrency,
            request.Rate,
            request.ValidFrom,
            request.ValidTo,
            "system");

        await _repository.AddAsync(entity, ct);
    }
}
