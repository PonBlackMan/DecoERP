using DecoERP.Application.Quotes.Commands;
using DecoERP.Application.Quotes.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/quote-packages")]
[Authorize]
public class QuotePackagesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPackages([FromQuery] bool activeOnly = true)
    {
        var result = await mediator.Send(new GetQuotePackagesQuery(activeOnly));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePackage([FromBody] CreateQuotePackageCommand command)
    {
        var id = await mediator.Send(command);
        return CreatedAtAction(nameof(GetPackages), new { id }, new { id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePackage(Guid id)
    {
        var success = await mediator.Send(new DeleteQuotePackageCommand(id));
        return success ? NoContent() : NotFound();
    }
}
