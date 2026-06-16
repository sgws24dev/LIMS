using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/scheduling/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly SchedulingDbContext _db;
    private readonly IMaintenanceWindowRepository _maintenanceRepo;
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(
        IMediator mediator,
        SchedulingDbContext db,
        IMaintenanceWindowRepository maintenanceRepo,
        IAvailabilityService availabilityService)
    {
        _mediator = mediator;
        _db = db;
        _maintenanceRepo = maintenanceRepo;
        _availabilityService = availabilityService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAvailableSlots(
        [FromQuery] Guid resourceId,
        [FromQuery] DateOnly date)
    {
        var result = await _mediator.Send(new GetAvailabilityQuery(resourceId, date));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpGet("grid")]
    public async Task<IActionResult> GetSlotGrid(
        [FromQuery] Guid resourceId,
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to)
    {
        if (to < from || (to.DayNumber - from.DayNumber) > 7)
            return BadRequest(new ApiResponse(false, null, "Date range cannot exceed 7 days.", null));

        var result = await _mediator.Send(new GetSlotGridQuery(resourceId, from, to));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpGet("operating-hours/{resourceId:guid}")]
    public async Task<IActionResult> GetOperatingHours(Guid resourceId)
    {
        var result = await _mediator.Send(new GetOperatingHoursQuery(resourceId));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpPut("operating-hours/{resourceId:guid}")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> UpdateOperatingHours(
        Guid resourceId,
        [FromBody] UpdateOperatingHoursRequest request)
    {
        var hours = await _db.ResourceOperatingHours
            .FindAsync([resourceId]);

        if (hours is null)
        {
            hours = new ResourceOperatingHours { ResourceId = resourceId };
            _db.ResourceOperatingHours.Add(hours);
        }

        hours.MondayStart = request.MondayStart;
        hours.MondayEnd = request.MondayEnd;
        hours.TuesdayStart = request.TuesdayStart;
        hours.TuesdayEnd = request.TuesdayEnd;
        hours.WednesdayStart = request.WednesdayStart;
        hours.WednesdayEnd = request.WednesdayEnd;
        hours.ThursdayStart = request.ThursdayStart;
        hours.ThursdayEnd = request.ThursdayEnd;
        hours.FridayStart = request.FridayStart;
        hours.FridayEnd = request.FridayEnd;
        hours.SaturdayStart = request.SaturdayStart;
        hours.SaturdayEnd = request.SaturdayEnd;
        hours.SundayStart = request.SundayStart;
        hours.SundayEnd = request.SundayEnd;
        hours.Timezone = request.Timezone ?? "UTC";
        hours.LastSyncedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _availabilityService.InvalidateCacheAsync(resourceId, DateOnly.FromDateTime(DateTime.UtcNow));

        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpPost("maintenance-windows")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> AddMaintenanceWindow([FromBody] AddMaintenanceWindowRequest request)
    {
        var window = new MaintenanceWindow
        {
            ResourceId = request.ResourceId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Reason = request.Reason,
            Source = "Manual"
        };

        await _maintenanceRepo.AddAsync(window, default);

        var startDate = DateOnly.FromDateTime(request.StartTime);
        var endDate = DateOnly.FromDateTime(request.EndTime);
        var current = startDate;
        while (current <= endDate)
        {
            await _availabilityService.InvalidateCacheAsync(request.ResourceId, current);
            current = current.AddDays(1);
        }

        return Ok(new ApiResponse(true, new { id = window.Id }, null, null));
    }

    [HttpDelete("maintenance-windows/{id:guid}")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> DeleteMaintenanceWindow(Guid id)
    {
        var window = await _maintenanceRepo.GetByIdAsync(id, default);
        if (window is null)
            return NotFound(new ApiResponse(false, null, "Maintenance window not found.", null));

        await _maintenanceRepo.DeleteAsync(window, default);
        return Ok(new ApiResponse(true, null, null, null));
    }
}
