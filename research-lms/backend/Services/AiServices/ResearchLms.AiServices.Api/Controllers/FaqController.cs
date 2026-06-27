using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.AiServices.Infrastructure.Services.TalkToAction;

namespace ResearchLms.AiServices.Api.Controllers;

[ApiController]
[Route("api/v1/ai/faq")]
[Authorize]
public class FaqController : ControllerBase
{
    private readonly ISopIndexingService _sopIndexing;

    public FaqController(ISopIndexingService sopIndexing)
    {
        _sopIndexing = sopIndexing;
    }

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromQuery] string q, [FromQuery] Guid? instrumentId)
    {
        var results = await _sopIndexing.SearchSopsAsync(q, instrumentId);
        return Ok(results);
    }

    [HttpPost("index")]
    public async Task<ActionResult> IndexSop([FromBody] IndexSopRequest request)
    {
        await _sopIndexing.IndexSopAsync(request.Title, request.Content, request.InstrumentId);
        return Ok();
    }

    [HttpGet("qr")]
    [AllowAnonymous]
    public IActionResult GetQrCode([FromQuery] string sopId)
    {
        // Stub: returns a placeholder URL that would link to the SOP document
        // In production: generate a QR code image using a library like QRCoder
        var url = $"{Request.Scheme}://{Request.Host}/sops/{sopId}";
        return Ok(new { url, sopId, message = "QR code generation stub. Use QRCoder in production." });
    }
}

public record IndexSopRequest(string Title, string Content, Guid InstrumentId);
