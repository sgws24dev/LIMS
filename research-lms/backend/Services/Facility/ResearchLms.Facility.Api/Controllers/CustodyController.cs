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
[Route("api/v1/custody")]
public class CustodyController : ControllerBase
{
    private readonly IMediator _mediator;
    public CustodyController(IMediator mediator) => _mediator = mediator;

    [HttpGet("assets/{assetId:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> GetChain(
        Guid assetId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetCustodyChainQuery(assetId, page, pageSize));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { items = result.Value!.Items, totalCount = result.Value.TotalCount }, result.Value.TotalCount));
    }

    [HttpGet("assets/{assetId:guid}/current")]
    public async Task<ActionResult<ApiResponse<CustodyEventDto?>>> GetCurrent(Guid assetId)
    {
        var result = await _mediator.Send(new GetCurrentCustodianQuery(assetId));
        if (result.IsFailure) return BadRequest(ApiResponse<CustodyEventDto?>.Fail(result.Error!));
        return Ok(ApiResponse<CustodyEventDto?>.Ok(result.Value));
    }

    [HttpPost("transfer")]
    public async Task<ActionResult<ApiResponse<object>>> Transfer([FromBody] TransferAssetCustodyRequest dto)
    {
        var result = await _mediator.Send(new TransferAssetCustodyCommand(dto));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return CreatedAtAction(nameof(GetChain), new { assetId = dto.AssetId }, ApiResponse<object>.Ok(new { id = result.Value }));
    }
}
