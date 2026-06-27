using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.Commands.Erp;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Pricing;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/reconciliation")]
[Authorize]
public class ReconciliationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IPaymentReconciliationRepository _repository;

    public ReconciliationController(IMediator mediator, IPaymentReconciliationRepository repository)
    {
        _mediator = mediator;
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReconciliationDto>>> GetAll([FromQuery] string? status)
    {
        var result = await _mediator.Send(new GetReconciliationsQuery(status));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateReconciliationCommand command)
    {
        await _mediator.Send(command);
        return Ok();
    }

    [HttpPost("{id}/match")]
    public async Task<ActionResult> Match(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Reconciliation {id} not found.");
        entity.Match("system");
        await _repository.UpdateAsync(entity);
        return Ok();
    }

    [HttpPost("{id}/dispute")]
    public async Task<ActionResult> Dispute(Guid id, [FromBody] DisputeRequest request)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Reconciliation {id} not found.");
        entity.Dispute(request.Notes, "system");
        await _repository.UpdateAsync(entity);
        return Ok();
    }
}

public record DisputeRequest(string Notes);
