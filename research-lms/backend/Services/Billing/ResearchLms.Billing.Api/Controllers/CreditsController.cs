using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/credits")]
[Authorize]
public class CreditsController : ControllerBase
{
    private readonly BillingDbContext _context;

    public CreditsController(BillingDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CreditDto>>> GetAll()
    {
        var entities = await _context.Credits
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var dtos = entities.Select(e => new CreditDto
        {
            Id = e.Id,
            InstitutionId = e.InstitutionId,
            Balance = e.Balance,
            Currency = e.Currency,
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("adjust")]
    public async Task<ActionResult<CreditDto>> AdjustBalance([FromBody] AdjustCreditRequest request)
    {
        var credit = await _context.Credits
            .FirstOrDefaultAsync(c => c.InstitutionId == request.InstitutionId);

        if (credit == null)
        {
            credit = new Credit(request.InstitutionId, request.Amount, request.Currency ?? "AED", "system");
            _context.Credits.Add(credit);
        }
        else
        {
            credit.AdjustBalance(request.Amount, "system");
            _context.Credits.Update(credit);
        }

        await _context.SaveChangesAsync();

        return Ok(new CreditDto
        {
            Id = credit.Id,
            InstitutionId = credit.InstitutionId,
            Balance = credit.Balance,
            Currency = credit.Currency,
        });
    }
}

public record AdjustCreditRequest(Guid InstitutionId, decimal Amount, string? Currency);
