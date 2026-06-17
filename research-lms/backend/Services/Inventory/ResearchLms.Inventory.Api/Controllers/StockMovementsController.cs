using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Inventory.Application.Queries.StockMovements;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/inventory/stock-movements")]
public class StockMovementsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? inventoryItemId,
        [FromQuery] StockTransactionType? transactionType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetStockMovementsQuery(inventoryItemId, transactionType, page, pageSize);
        var result = await mediator.Send(query);
        return Ok(result);
    }
}
