using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.AiServices.Application.Commands.Helpdesk;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Application.Queries.Helpdesk;
using ResearchLms.AiServices.Application.Services;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Api.Controllers;

[ApiController]
[Route("api/v1/ai/helpdesk")]
[Authorize]
public class HelpdeskController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHelpdeskMetricsService _metricsService;
    private readonly ITenantContext _tenant;

    public HelpdeskController(IMediator mediator, IHelpdeskMetricsService metricsService, ITenantContext tenant)
    {
        _mediator = mediator;
        _metricsService = metricsService;
        _tenant = tenant;
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations()
    {
        var result = await _mediator.Send(new GetConversationsQuery());
        return Ok(result);
    }

    [HttpGet("conversations/{id:guid}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(Guid id)
    {
        var result = await _mediator.Send(new GetConversationByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("conversations")]
    public async Task<ActionResult<Guid>> StartConversation([FromBody] StartConversationRequest request)
    {
        var id = await _mediator.Send(new StartConversationCommand(request.Topic));
        return CreatedAtAction(nameof(GetConversation), new { id }, id);
    }

    [HttpPost("conversations/{id:guid}/create-ticket")]
    public async Task<ActionResult<Guid>> CreateTicket(Guid id, [FromBody] CreateTicketRequest request)
    {
        var ticketId = await _mediator.Send(new CreateTicketFromConversationCommand(
            id, request.ConversationSummary, request.Priority, request.Category));
        return Ok(ticketId);
    }

    [HttpGet("tickets")]
    public async Task<ActionResult<List<TicketDto>>> GetTickets()
    {
        var result = await _mediator.Send(new GetTicketsQuery());
        return Ok(result);
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<HelpdeskMetricsDto>> GetMetrics([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;
        var metrics = await _metricsService.GetMetricsAsync(_tenant.TenantId, fromDate, toDate);
        return Ok(metrics);
    }
}
