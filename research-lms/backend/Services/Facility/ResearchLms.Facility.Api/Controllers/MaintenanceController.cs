using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Facilities.Application.Commands;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Facilities.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/maintenance")]
public class MaintenanceController : ControllerBase
{
    private readonly IMediator _mediator;
    public MaintenanceController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] Guid? assetId, [FromQuery] string? status,
        [FromQuery] DateOnly? dateFrom, [FromQuery] DateOnly? dateTo,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetMaintenanceRecordsQuery(assetId, status, dateFrom, dateTo, page, pageSize));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { items = result.Value!.Items, totalCount = result.Value.TotalCount }, result.Value.TotalCount));
    }

    [HttpGet("calendar")]
    public async Task<ActionResult<ApiResponse<object>>> GetCalendar(
        [FromQuery] int month, [FromQuery] int year, [FromQuery] Guid? facilityId)
    {
        var result = await _mediator.Send(new GetMaintenanceCalendarQuery(month, year, facilityId));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(result.Value!));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<MaintenanceRecordDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetMaintenanceRecordByIdQuery(id));
        if (result.IsFailure) return NotFound(ApiResponse<MaintenanceRecordDto>.Fail(result.Error!));
        return Ok(ApiResponse<MaintenanceRecordDto>.Ok(result.Value!));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateMaintenanceRecordRequest dto)
    {
        var result = await _mediator.Send(new CreateMaintenanceRecordCommand(dto));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return CreatedAtAction(nameof(GetById), new { id = result.Value }, ApiResponse<object>.Ok(new { id = result.Value }));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(Guid id, [FromBody] UpdateMaintenanceRecordRequest dto)
    {
        var result = await _mediator.Send(new UpdateMaintenanceRecordCommand(id, dto));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { }));
    }

    [HttpPatch("{id:guid}/complete")]
    public async Task<ActionResult<ApiResponse<object>>> Complete(Guid id, [FromBody] CompleteMaintenanceRecordRequest dto)
    {
        var result = await _mediator.Send(new CompleteMaintenanceRecordCommand(id, dto));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { }));
    }

    [HttpGet("{id:guid}/work-orders")]
    public async Task<ActionResult<ApiResponse<object>>> GetWorkOrders(Guid id)
    {
        var result = await _mediator.Send(new GetWorkOrdersQuery(id, null, null, null));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(result.Value!));
    }

    [HttpPost("{id:guid}/work-orders")]
    public async Task<ActionResult<ApiResponse<object>>> CreateWorkOrder(Guid id, [FromBody] CreateWorkOrderRequest dto)
    {
        var result = await _mediator.Send(new CreateWorkOrderCommand(id, dto));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return CreatedAtAction(nameof(GetWorkOrders), new { id }, ApiResponse<object>.Ok(new { id = result.Value }));
    }

    [HttpPut("work-orders/{workOrderId:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateWorkOrder(Guid workOrderId, [FromBody] UpdateWorkOrderRequest dto)
    {
        var result = await _mediator.Send(new UpdateWorkOrderCommand(workOrderId, dto));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { }));
    }

    [HttpPatch("work-orders/{workOrderId:guid}/resolve")]
    public async Task<ActionResult<ApiResponse<object>>> ResolveWorkOrder(Guid workOrderId, [FromBody] ResolveWorkOrderRequest dto)
    {
        var result = await _mediator.Send(new ResolveWorkOrderCommand(workOrderId, dto));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
