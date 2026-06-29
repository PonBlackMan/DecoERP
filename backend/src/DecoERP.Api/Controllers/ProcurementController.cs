using DecoERP.Application.Procurement.Commands;
using DecoERP.Application.Procurement.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/procurement")]
[Authorize]
public class ProcurementController(ISender mediator) : ControllerBase
{
    [HttpGet("vendors")]
    public async Task<IActionResult> GetVendors(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await mediator.Send(new GetVendorsQuery(search, page, pageSize));
        return Ok(result);
    }

    [HttpPost("vendors")]
    public async Task<IActionResult> CreateVendor([FromBody] CreateVendorCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetVendors), new { id }, new { id });
    }

    [HttpGet("purchase-orders")]
    public async Task<IActionResult> GetPurchaseOrders(
        [FromQuery] Guid? vendorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetPurchaseOrdersQuery(vendorId, page, pageSize));
        return Ok(result);
    }

    [HttpPost("purchase-orders")]
    public async Task<IActionResult> CreatePurchaseOrder([FromBody] CreatePurchaseOrderCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetPurchaseOrders), new { id }, new { id });
    }
}
