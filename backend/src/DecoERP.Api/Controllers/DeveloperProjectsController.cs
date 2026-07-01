using DecoERP.Application.Cases.Commands;
using DecoERP.Application.Cases.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/developer-projects")]
[Authorize]
public class DeveloperProjectsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDeveloperProjects([FromQuery] bool activeOnly = false)
    {
        var result = await mediator.Send(new GetDeveloperProjectsQuery(activeOnly));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDeveloperProject([FromBody] CreateDeveloperProjectCommand command)
    {
        var id = await mediator.Send(command);
        return CreatedAtAction(nameof(GetDeveloperProjects), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDeveloperProject(Guid id, [FromBody] UpdateDeveloperProjectRequest request)
    {
        var success = await mediator.Send(new UpdateDeveloperProjectCommand(
            id, request.Name, request.DeveloperName, request.Address, request.Notes,
            request.ContactName, request.ContactPhone, request.ContactEmail,
            request.CommissionRatePercent, request.DeliveryRequirements, request.BrandStandards, request.IsActive));
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDeveloperProject(Guid id)
    {
        var success = await mediator.Send(new DeleteDeveloperProjectCommand(id));
        return success ? NoContent() : NotFound();
    }
}

public record UpdateDeveloperProjectRequest(
    string Name,
    string DeveloperName,
    string? Address,
    string? Notes,
    string? ContactName,
    string? ContactPhone,
    string? ContactEmail,
    decimal? CommissionRatePercent,
    string? DeliveryRequirements,
    string? BrandStandards,
    bool IsActive);
