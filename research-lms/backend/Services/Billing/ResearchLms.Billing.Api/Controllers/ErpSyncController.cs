using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Application.Commands.Erp;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/erp-sync")]
[Authorize]
public class ErpSyncController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IMediator _mediator;

    public ErpSyncController(BillingDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ErpSyncLogDto>>> GetAll()
    {
        var entities = await _context.ErpSyncLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(100)
            .ToListAsync();

        var dtos = entities.Select(e => new ErpSyncLogDto
        {
            Id = e.Id,
            InvoiceId = e.InvoiceId,
            Direction = e.Direction,
            Status = e.Status.ToString(),
            ErrorMessage = e.ErrorMessage,
            AttemptCount = e.AttemptCount,
            LastAttemptedAt = e.LastAttemptedAt,
            CreatedAt = e.CreatedAt,
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{invoiceId}")]
    public async Task<ActionResult<IReadOnlyList<ErpSyncLogDto>>> GetByInvoice(Guid invoiceId)
    {
        var entities = await _context.ErpSyncLogs
            .Where(l => l.InvoiceId == invoiceId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        var dtos = entities.Select(e => new ErpSyncLogDto
        {
            Id = e.Id,
            InvoiceId = e.InvoiceId,
            Direction = e.Direction,
            Status = e.Status.ToString(),
            ErrorMessage = e.ErrorMessage,
            AttemptCount = e.AttemptCount,
            LastAttemptedAt = e.LastAttemptedAt,
            CreatedAt = e.CreatedAt,
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("invoices/{invoiceId}/resync-erp")]
    public async Task<ActionResult> RetrySync(Guid invoiceId)
    {
        await _mediator.Send(new RetryErpSyncCommand(invoiceId));
        return NoContent();
    }
}
