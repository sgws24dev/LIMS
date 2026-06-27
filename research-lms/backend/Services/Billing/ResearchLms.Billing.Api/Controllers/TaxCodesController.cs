using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Pricing;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/tax-codes")]
[Authorize]
public class TaxCodesController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IMediator _mediator;

    public TaxCodesController(BillingDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaxCodeDto>>> GetAll([FromQuery] string? country)
    {
        var result = await _mediator.Send(new GetTaxCodesQuery(country));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TaxCodeDto>> Create([FromBody] TaxCodeDto dto)
    {
        var entity = new TaxCode(
            dto.Name,
            dto.Description,
            dto.Country,
            dto.Region,
            dto.Rate,
            dto.IsDefault,
            dto.IsCompound,
            dto.EffectiveFrom,
            dto.EffectiveTo,
            "system");

        _context.TaxCodes.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaxCodeDto>> Update(Guid id, [FromBody] TaxCodeDto dto)
    {
        var entity = await _context.TaxCodes.FindAsync(id);
        if (entity == null) return NotFound();

        _context.Entry(entity).CurrentValues.SetValues(new
        {
            dto.Name,
            dto.Description,
            dto.Country,
            dto.Region,
            dto.Rate,
            dto.IsDefault,
            dto.IsCompound,
            EffectiveFrom = dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
        });
        entity.MarkUpdated("system");
        await _context.SaveChangesAsync();

        dto.Id = id;
        return Ok(dto);
    }
}
