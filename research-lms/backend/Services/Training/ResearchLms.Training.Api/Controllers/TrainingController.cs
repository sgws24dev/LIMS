using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Application.Commands;
using ResearchLms.Training.Application.DTOs;
using ResearchLms.Training.Application.Queries;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.ValueObjects;

namespace ResearchLms.Training.Api.Controllers;

[ApiController]
[Route("api/v1/training")]
[Authorize]
public class TrainingController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public TrainingController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet("competencies")]
    public async Task<IActionResult> GetCompetencies(
        [FromQuery] CompetencyCategory? category)
    {
        var query = new GetCompetenciesQuery(category);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<CompetencyDto>>.Ok(result.ToList(), result.Count()));
    }

    [HttpPost("competencies")]
    public async Task<IActionResult> CreateCompetency([FromBody] CreateCompetencyRequest request)
    {
        var command = new CreateCompetencyCommand(
            request.Name,
            request.Description,
            request.Category,
            request.ValidityPeriodDays,
            request.RequiresRenewal);

        var competencyId = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetCompetencies), new { id = competencyId },
            ApiResponse<Guid>.Ok(competencyId));
    }

    [HttpPut("competencies/{id:guid}")]
    public async Task<IActionResult> UpdateCompetency(Guid id, [FromBody] UpdateCompetencyRequest request)
    {
        var command = new UpdateCompetencyCommand(
            id,
            request.Name,
            request.Description,
            request.Category,
            request.ValidityPeriodDays,
            request.RequiresRenewal);

        await _mediator.Send(command);

        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpDelete("competencies/{id:guid}")]
    public async Task<IActionResult> DeleteCompetency(Guid id)
    {
        await _mediator.Send(new DeleteCompetencyCommand(id));
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpGet("user-competencies")]
    public async Task<IActionResult> GetUserCompetencies(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? competencyId,
        [FromQuery] CompetencyStatus? status)
    {
        var query = new GetUserCompetenciesQuery(userId, competencyId, status);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<UserCompetencyDto>>.Ok(result.ToList(), result.Count()));
    }

    [HttpPost("user-competencies")]
    public async Task<IActionResult> AssignUserCompetency([FromBody] AssignCompetencyRequest request)
    {
        var command = new AssignCompetencyCommand(
            request.UserId,
            request.CompetencyId,
            request.AchievedAt,
            request.ExpiresAt);

        var userCompetencyId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.Ok(userCompetencyId));
    }

    [HttpPut("user-competencies/{id:guid}/renew")]
    public async Task<IActionResult> RenewUserCompetency(Guid id)
    {
        var command = new RenewCompetencyCommand(id, DateTime.UtcNow.AddYears(1));
        await _mediator.Send(command);
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpGet("prerequisite-rules")]
    public async Task<IActionResult> GetPrerequisiteRules(
        [FromQuery] Guid? instrumentId)
    {
        var query = new GetPrerequisiteRulesQuery(instrumentId);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<PrerequisiteRuleDto>>.Ok(result.ToList(), result.Count()));
    }

    [HttpPost("prerequisite-rules")]
    public async Task<IActionResult> CreatePrerequisiteRule([FromBody] CreatePrerequisiteRuleRequest request)
    {
        var command = new CreatePrerequisiteRuleCommand(
            _currentUser.TenantId,
            request.InstrumentId,
            request.CompetencyId);

        var ruleId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.Ok(ruleId));
    }

    [HttpDelete("prerequisite-rules/{id:guid}")]
    public async Task<IActionResult> DeletePrerequisiteRule(Guid id)
    {
        await _mediator.Send(new DeletePrerequisiteRuleCommand(id));
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpPost("prerequisites/validate")]
    public async Task<IActionResult> ValidatePrerequisites([FromBody] ValidatePrerequisitesRequest request)
    {
        var query = new ValidatePrerequisitesQuery(
            request.UserId,
            request.InstrumentId ?? Guid.Empty);

        var result = await _mediator.Send(query);

        return Ok(ApiResponse<PrerequisiteResult>.Ok(result));
    }
}
