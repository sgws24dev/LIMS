using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Application.Queries;

namespace ResearchLms.Compliance.Api.Controllers;

[ApiController]
[Route("api/v1/compliance/audit-logs")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] string? entityType, [FromQuery] Guid? entityId,
        [FromQuery] string? userId, [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo, [FromQuery] string? operation,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var (items, total) = await _mediator.Send(new GetAuditLogsQuery(entityType, entityId, userId, dateFrom, dateTo, operation, page, pageSize));
        return Ok(new { items, totalCount = total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AuditLogEntryDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetAuditLogByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("verify-chain")]
    public async Task<ActionResult<HashChainVerificationDto>> VerifyChain()
    {
        var result = await _mediator.Send(new VerifyAuditChainQuery());
        return Ok(result);
    }

    [HttpGet("change-history")]
    public async Task<ActionResult<IReadOnlyList<AuditLogEntryDto>>> GetChangeHistory(
        [FromQuery] string entityType, [FromQuery] Guid entityId)
    {
        var result = await _mediator.Send(new GetChangeHistoryQuery(entityType, entityId));
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<ActionResult> Export(
        [FromQuery] string? entityType, [FromQuery] Guid? entityId,
        [FromQuery] string? userId, [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo, [FromQuery] string? operation)
    {
        var csv = await _mediator.Send(new ExportAuditLogsQuery(entityType, entityId, userId, dateFrom, dateTo, operation));
        return File(csv, "text/csv", $"audit-logs-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }
}
