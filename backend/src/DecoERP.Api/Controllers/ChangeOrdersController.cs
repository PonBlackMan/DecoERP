using DecoERP.Application.ChangeOrders.Commands;
using DecoERP.Application.ChangeOrders.Queries;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChangeOrdersController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetChangeOrdersQuery(projectId, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateChangeOrderCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateChangeOrderStatusRequest request)
    {
        var success = await mediator.Send(new UpdateChangeOrderStatusCommand(id, request.Status));
        return success ? NoContent() : NotFound();
    }
}

public record UpdateChangeOrderStatusRequest(ChangeOrderStatus Status);
