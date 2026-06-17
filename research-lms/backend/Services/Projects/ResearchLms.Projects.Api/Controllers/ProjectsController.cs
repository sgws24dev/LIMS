using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Projects.Application.Commands.Projects;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Application.Queries.Projects;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects")]
public class ProjectsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] ProjectStatus? status,
        [FromQuery] Guid? projectManagerId,
        [FromQuery] bool includeArchived = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetProjectsQuery(status, projectManagerId, includeArchived, page, pageSize);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetProjectByIdQuery(id);
        var result = await mediator.Send(query);
        if (result is null) return NotFound(new { success = false, message = "Project not found." });
        return Ok(result);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var query = new GetProjectDashboardStatsQuery();
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("budget-chart")]
    public async Task<IActionResult> GetBudgetChart([FromQuery] int monthsBack = 6)
    {
        var query = new GetMonthlyBudgetChartQuery(monthsBack);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectCommand cmd)
    {
        if (id != cmd.ProjectId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateProjectStatusRequest req)
    {
        var cmd = new UpdateProjectStatusCommand(id, req.NewStatus, Guid.Empty);
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPost("{id:guid}/archive")]
    [Authorize(Policy = "ProjectAdmin")]
    public async Task<IActionResult> Archive(Guid id)
    {
        var cmd = new ArchiveProjectCommand(id);
        await mediator.Send(cmd);
        return NoContent();
    }
}

public record UpdateProjectStatusRequest(ProjectStatus NewStatus);
public record UpdateWorkOrderStatusRequest(WorkOrderStatus NewStatus);
public record UpdateIssueStatusRequest(IssueStatus NewStatus);
public record SyncIssueRequest(string Provider);
