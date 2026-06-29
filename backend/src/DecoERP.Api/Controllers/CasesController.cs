using DecoERP.Application.Cases.Commands;
using DecoERP.Application.Cases.Queries;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCases(
        [FromQuery] CaseStage? stage,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetCasesQuery(stage, search, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCase([FromBody] CreateCaseCommand command)
    {
        var id = await mediator.Send(command);
        return CreatedAtAction(nameof(GetCases), new { id }, new { id });
    }

    [HttpPatch("{id}/stage")]
    public async Task<IActionResult> UpdateStage(Guid id, [FromBody] UpdateStageRequest request)
    {
        var success = await mediator.Send(new UpdateCaseStageCommand(id, request.Stage));
        return success ? NoContent() : NotFound();
    }

    [HttpPost("{id}/convert")]
    public async Task<IActionResult> ConvertToProject(Guid id, [FromBody] ConvertRequest request)
    {
        var projectId = await mediator.Send(new ConvertCaseToProjectCommand(id, request.ProjectCode, request.StartDate, request.EndDate));
        return projectId.HasValue ? Ok(new { projectId }) : BadRequest(new { message = "案件未簽約或不存在" });
    }
}

public record UpdateStageRequest(CaseStage Stage);
public record ConvertRequest(string ProjectCode, DateTime? StartDate, DateTime? EndDate);
