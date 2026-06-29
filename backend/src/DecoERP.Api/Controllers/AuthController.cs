using DecoERP.Application.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ISender mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await mediator.Send(command);
        if (result is null)
            return Unauthorized(new { message = "帳號或密碼錯誤" });

        return Ok(result);
    }
}
