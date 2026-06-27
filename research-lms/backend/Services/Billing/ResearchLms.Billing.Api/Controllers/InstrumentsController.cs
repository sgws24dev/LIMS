using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Instruments;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/instruments")]
[Authorize]
public class InstrumentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InstrumentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id}/365")]
    public async Task<ActionResult<Instrument365Dto>> GetInstrument365(
        Guid id,
        [FromQuery] int year)
    {
        var result = await _mediator.Send(new GetInstrument365Query(id, year));
        return Ok(result);
    }
}
