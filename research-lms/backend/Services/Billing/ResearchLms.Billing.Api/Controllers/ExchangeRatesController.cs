using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.Commands.Pricing;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Pricing;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/exchange-rates")]
[Authorize]
public class ExchangeRatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ExchangeRatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExchangeRateDto>>> GetAll([FromQuery] string? fromCurrency, [FromQuery] string? toCurrency)
    {
        var result = await _mediator.Send(new GetExchangeRatesQuery(fromCurrency, toCurrency));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateExchangeRateCommand command)
    {
        await _mediator.Send(command);
        return Ok();
    }
}
