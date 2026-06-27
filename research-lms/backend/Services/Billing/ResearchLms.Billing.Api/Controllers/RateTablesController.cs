using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Application.Commands.Pricing;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/rate-tables")]
[Authorize]
public class RateTablesController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IMediator _mediator;

    public RateTablesController(BillingDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RateTableDto>>> GetByModel([FromQuery] Guid pricingModelId)
    {
        var entities = await _context.RateTables
            .Where(r => r.PricingModelId == pricingModelId)
            .OrderBy(r => r.CustomerType)
            .ThenBy(r => r.MinQuantity)
            .ToListAsync();

        var dtos = entities.Select(e => new RateTableDto
        {
            Id = e.Id,
            CustomerType = e.CustomerType.ToString(),
            Rate = e.Rate,
            MinQuantity = e.MinQuantity,
            MaxQuantity = e.MaxQuantity,
            EffectiveFrom = e.EffectiveFrom,
            EffectiveTo = e.EffectiveTo,
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<RateTableDto>> Create([FromBody] SetRateTableCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetByModel), new { pricingModelId = command.PricingModelId }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] SetRateTableCommand command)
    {
        var entity = await _context.RateTables.FindAsync(id)
            ?? throw new KeyNotFoundException($"Rate table entry {id} not found.");

        _context.RateTables.Remove(entity);
        await _context.SaveChangesAsync();

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
