using DecoERP.Application.Projects.Commands;
using DecoERP.Application.Projects.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/invoice-receivables")]
[Authorize]
public class InvoiceReceivablesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetInvoiceReceivables([FromQuery] Guid? projectId, [FromQuery] bool overdueOnly = false)
    {
        var result = await mediator.Send(new GetInvoiceReceivablesQuery(projectId, overdueOnly));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoiceReceivable([FromBody] CreateInvoiceReceivableCommand command)
    {
        var id = await mediator.Send(command);
        return CreatedAtAction(nameof(GetInvoiceReceivables), new { id }, new { id });
    }

    [HttpPost("{id}/payments")]
    public async Task<IActionResult> RecordPayment(Guid id, [FromBody] RecordPaymentRequest request)
    {
        var success = await mediator.Send(new RecordInvoiceReceivablePaymentCommand(id, request.Amount));
        return success ? NoContent() : NotFound();
    }
}

public record RecordPaymentRequest(decimal Amount);
