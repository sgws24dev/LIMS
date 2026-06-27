using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.AiServices.Infrastructure.Services.Mcp;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Api.Controllers;

[ApiController]
[Route("mcp")]
public class McpController : ControllerBase
{
    private readonly McpServer _mcpServer;
    private readonly ICurrentUser _currentUser;

    public McpController(McpServer mcpServer, ICurrentUser currentUser)
    {
        _mcpServer = mcpServer;
        _currentUser = currentUser;
    }

    [HttpGet("tools")]
    public ActionResult<IReadOnlyList<object>> ListTools()
    {
        var tools = _mcpServer.ListTools();
        var result = tools.Select(t => new
        {
            name = t.Name,
            description = t.Description,
            inputSchema = t.InputSchema
        }).ToList();
        return Ok(result);
    }

    [HttpPost("execute")]
    public async Task<ActionResult> Execute([FromBody] McpExecuteRequest request, CancellationToken ct)
    {
        if (!_currentUser.IsAuthenticated)
            return Unauthorized();

        var input = request.Input.HasValue ? request.Input.Value : JsonSerializer.SerializeToElement(new { });
        var result = await _mcpServer.ExecuteAsync(request.ToolName, input, _currentUser.UserId, ct);

        if (!result.Success)
            return BadRequest(result.Result);

        return Ok(result.Result);
    }
}

public class McpExecuteRequest
{
    public string ToolName { get; set; } = string.Empty;
    public JsonElement? Input { get; set; }
}
