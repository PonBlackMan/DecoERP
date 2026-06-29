using DecoERP.Application.HR.Commands;
using DecoERP.Application.HR.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DecoERP.Application.Common.Interfaces;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/hr")]
[Authorize]
public class HRController(ISender mediator, IDecoDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees(
        [FromQuery] bool? isActive,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetEmployeesQuery(isActive, search, page, pageSize));
        return Ok(result);
    }

    [HttpPost("employees")]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetEmployees), new { id }, new { id });
    }

    [HttpPatch("employees/{id}/status")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var entity = await db.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == currentUser.TenantId);

        if (entity is null)
            return NotFound();

        entity.IsActive = !entity.IsActive;
        await db.SaveChangesAsync(CancellationToken.None);
        return NoContent();
    }
}
