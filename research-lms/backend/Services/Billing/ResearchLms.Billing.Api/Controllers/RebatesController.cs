using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/rebates")]
[Authorize]
public class RebatesController : ControllerBase
{
    private readonly BillingDbContext _context;

    public RebatesController(BillingDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RebateDto>>> GetAll()
    {
        var entities = await _context.Rebates
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var dtos = entities.Select(e => new RebateDto
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            RebateType = e.RebateType.ToString(),
            Value = e.Value,
            MinSpendAmount = e.MinSpendAmount,
            MaxDiscountAmount = e.MaxDiscountAmount,
            IsActive = e.IsActive,
            ValidFrom = e.ValidFrom,
            ValidTo = e.ValidTo,
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RebateDto>> GetById(Guid id)
    {
        var entity = await _context.Rebates.FindAsync(id);
        if (entity == null) return NotFound();

        return Ok(new RebateDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            RebateType = entity.RebateType.ToString(),
            Value = entity.Value,
            MinSpendAmount = entity.MinSpendAmount,
            MaxDiscountAmount = entity.MaxDiscountAmount,
            IsActive = entity.IsActive,
            ValidFrom = entity.ValidFrom,
            ValidTo = entity.ValidTo,
        });
    }

    [HttpPost]
    public async Task<ActionResult<RebateDto>> Create([FromBody] RebateDto dto)
    {
        var entity = new Rebate(
            dto.Name,
            dto.Description,
            Enum.Parse<RebateType>(dto.RebateType),
            dto.Value,
            dto.MinSpendAmount,
            dto.MaxDiscountAmount,
            dto.ValidFrom,
            dto.ValidTo,
            "system");

        _context.Rebates.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RebateDto>> Update(Guid id, [FromBody] RebateDto dto)
    {
        var entity = await _context.Rebates.FindAsync(id);
        if (entity == null) return NotFound();

        _context.Entry(entity).CurrentValues.SetValues(new
        {
            dto.Name,
            dto.Description,
            RebateType = Enum.Parse<RebateType>(dto.RebateType),
            dto.Value,
            dto.MinSpendAmount,
            dto.MaxDiscountAmount,
            dto.IsActive,
            ValidFrom = dto.ValidFrom,
            ValidTo = dto.ValidTo,
        });
        entity.MarkUpdated("system");
        await _context.SaveChangesAsync();

        dto.Id = id;
        return Ok(dto);
    }
}
