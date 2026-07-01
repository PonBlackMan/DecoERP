using DecoERP.Application.Projects.Commands;
using DecoERP.Application.Projects.Queries;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] ProjectStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetProjectsQuery(status, search, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateProjectStatusRequest request)
    {
        var success = await mediator.Send(new UpdateProjectStatusCommand(id, request.Status));
        return success ? NoContent() : NotFound();
    }

    [HttpPost("{id}/portal-link")]
    public async Task<IActionResult> GeneratePortalLink(Guid id, [FromBody] GeneratePortalLinkRequest request)
    {
        var result = await mediator.Send(new GeneratePortalLinkCommand(id, request.PhoneLastFour, request.ExpiresInDays ?? 180));
        return result is null ? NotFound() : Ok(result);
    }
}

public record UpdateProjectStatusRequest(ProjectStatus Status);
public record GeneratePortalLinkRequest(string PhoneLastFour, int? ExpiresInDays);
