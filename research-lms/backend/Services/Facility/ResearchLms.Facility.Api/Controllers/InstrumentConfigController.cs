using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/assets")]
public class InstrumentConfigController : ControllerBase
{
    private readonly IAssetRepository _assetRepository;
    public InstrumentConfigController(IAssetRepository assetRepository) => _assetRepository = assetRepository;

    public record InstrumentConfigRequest(
        string? IpAddress, int? Port, string? ConnectionProtocol,
        string? Firmware, int? MaintenanceIntervalDays,
        bool IotEnabled, List<string>? MetricKeys);

    [HttpGet("{id:guid}/instrument-config")]
    public async Task<ActionResult<ApiResponse<object>>> GetConfig(Guid id)
    {
        var asset = await _assetRepository.GetByIdAsync(id);
        if (asset is not Instrument instrument)
            return NotFound(ApiResponse<object>.Fail("Instrument not found"));

        return Ok(ApiResponse<object>.Ok(new
        {
            instrument.IpAddress,
            instrument.Port,
            ConnectionProtocol = instrument.ConnectionProtocol?.ToString(),
            instrument.Firmware,
            instrument.MaintenanceIntervalDays,
            instrument.IotEnabled,
            MetricKeys = instrument.InstrumentConfig?.MetricKeys ?? new List<string>()
        }));
    }

    [HttpPut("{id:guid}/instrument-config")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateConfig(Guid id, [FromBody] InstrumentConfigRequest dto)
    {
        var asset = await _assetRepository.GetByIdAsync(id);
        if (asset is not Instrument instrument)
            return NotFound(ApiResponse<object>.Fail("Instrument not found"));

        if (Enum.TryParse<ConnectionProtocol>(dto.ConnectionProtocol, out var protocol))
        {
            instrument.UpdateInstrument(
                dto.IpAddress, dto.Port, protocol,
                dto.Firmware, instrument.LastCalibrationDate, instrument.NextCalibrationDate,
                dto.MaintenanceIntervalDays, dto.IotEnabled);
        }
        else
        {
            instrument.UpdateInstrument(
                dto.IpAddress, dto.Port, null,
                dto.Firmware, instrument.LastCalibrationDate, instrument.NextCalibrationDate,
                dto.MaintenanceIntervalDays, dto.IotEnabled);
        }

        await _assetRepository.UpdateAsync(instrument);
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
