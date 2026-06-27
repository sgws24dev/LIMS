using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.Commands.Erp;
using ResearchLms.Billing.Application.Commands.Invoices;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Invoices;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvoicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<InvoiceDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (items, totalCount) = await _mediator.Send(new GetInvoicesQuery(status, dateFrom, dateTo, search, page, pageSize));
        return Ok(new PaginatedResult<InvoiceDto>(items, totalCount, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetInvoiceByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceDto>> Update(Guid id, [FromBody] UpdateInvoiceCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch.");
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult> Send(Guid id)
    {
        await _mediator.Send(new SendInvoiceCommand(id));
        return NoContent();
    }

    [HttpPost("{id}/void")]
    public async Task<ActionResult> Void(Guid id, [FromBody] VoidInvoiceCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch.");
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/pay")]
    public async Task<ActionResult> RecordPayment(Guid id, [FromBody] RecordPaymentCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch.");
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}/pdf")]
    public async Task<ActionResult> GetPdf(Guid id)
    {
        var pdfBytes = await _mediator.Send(new GetInvoicePdfQuery(id));
        return File(pdfBytes, "application/pdf", $"invoice-{id}.pdf");
    }

    [HttpPost("{id}/resync-erp")]
    public async Task<ActionResult> ResyncErp(Guid id)
    {
        await _mediator.Send(new RetryErpSyncCommand(id));
        return NoContent();
    }

    [HttpPost("generate")]
    public async Task<ActionResult<InvoiceDto>> Generate([FromBody] GenerateInvoiceCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}

public record PaginatedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
