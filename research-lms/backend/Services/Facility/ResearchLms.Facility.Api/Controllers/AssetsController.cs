using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Facilities.Application.Commands;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Queries;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Facilities.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/assets")]
public class AssetsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IBarcodeService _barcodeService;

    public AssetsController(IMediator mediator, IBarcodeService barcodeService)
    {
        _mediator = mediator;
        _barcodeService = barcodeService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] string? search, [FromQuery] string? category,
        [FromQuery] string? status, [FromQuery] Guid? facilityId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAssetsQuery(search, category, status, facilityId, page, pageSize));
        if (result.IsFailure)
            return BadRequest(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<object>.Ok(new { items = result.Value!.Items, totalCount = result.Value.TotalCount }, result.Value.TotalCount));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AssetDetailDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetAssetByIdQuery(id));
        if (result.IsFailure)
            return NotFound(ApiResponse<AssetDetailDto>.Fail(result.Error!));

        return Ok(ApiResponse<AssetDetailDto>.Ok(result.Value!));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateAssetRequest dto)
    {
        var result = await _mediator.Send(new CreateAssetCommand(dto));
        if (result.IsFailure)
            return BadRequest(ApiResponse<object>.Fail(result.Error!));

        return CreatedAtAction(nameof(GetById), new { id = result.Value }, ApiResponse<object>.Ok(new { id = result.Value }));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(Guid id, [FromBody] UpdateAssetRequest dto)
    {
        var result = await _mediator.Send(new UpdateAssetCommand(id, dto));
        if (result.IsFailure)
            return NotFound(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<object>.Ok(new { }));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var result = await _mediator.Send(new DecommissionAssetCommand(id, null));
        if (result.IsFailure)
            return NotFound(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<object>.Ok(new { }));
    }

    [HttpPatch("{id:guid}/decommission")]
    public async Task<ActionResult<ApiResponse<object>>> Decommission(Guid id, [FromBody] string? reason)
    {
        var result = await _mediator.Send(new DecommissionAssetCommand(id, reason));
        if (result.IsFailure)
            return NotFound(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<object>.Ok(new { }));
    }

    [HttpGet("{id:guid}/qr")]
    [Produces("image/png")]
    public async Task<IActionResult> GetQrCode(Guid id, [FromQuery] bool label = false)
    {
        var result = await _mediator.Send(new GetAssetByIdQuery(id));
        if (result.IsFailure)
            return NotFound();

        var asset = result.Value!;
        var payload = $"https://app.researchlms.com/facility/assets/{id}";
        byte[] png;

        if (label)
        {
            png = _barcodeService.GenerateAssetLabel(
                id.ToString(), asset.Name, asset.Identifier, asset.Location);
        }
        else
        {
            png = _barcodeService.GenerateQrCode(payload);
        }

        return File(png, "image/png", $"asset-{asset.Identifier}-qr.png");
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<object>>> Search(
        [FromQuery] string? q, [FromQuery] string? category,
        [FromQuery] string? status, [FromQuery] Guid? facilityId,
        [FromQuery] string? location, [FromQuery] string? customFieldKey,
        [FromQuery] string? customFieldValue,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var searchParams = new AssetSearchParams(q, category, status, facilityId,
            location, customFieldKey, customFieldValue, page, pageSize);
        var result = await _mediator.Send(new SearchAssetsQuery(searchParams));
        if (result.IsFailure)
            return BadRequest(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<object>.Ok(new { items = result.Value!.Items, totalCount = result.Value.TotalCount }, result.Value.TotalCount));
    }
}
