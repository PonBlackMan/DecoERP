using DecoERP.Application.Quotes.Commands;
using DecoERP.Application.Quotes.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuotesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetQuotes(
        [FromQuery] Guid? caseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetQuotesQuery(caseId, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuote([FromBody] CreateQuoteCommand command)
    {
        var id = await mediator.Send(command);
        return CreatedAtAction(nameof(GetQuotes), new { id }, new { id });
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var success = await mediator.Send(new ConfirmQuoteCommand(id));
        return success ? NoContent() : NotFound();
    }
}
