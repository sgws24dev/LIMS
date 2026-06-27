using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.Commands.Pricing;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Pricing;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/pricing-models")]
[Authorize]
public class PricingModelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PricingModelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PricingModelDto>>> GetAll([FromQuery] bool? isActive)
    {
        var result = await _mediator.Send(new GetPricingModelsQuery(isActive));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PricingModelDto>> Create([FromBody] CreatePricingModelCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PricingModelDto>> Update(Guid id, [FromBody] UpdatePricingModelCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch.");
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<PriceBreakdownDto>> Calculate([FromBody] CalculatePriceQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
