using DecoERP.Application.Finance.Commands;
using DecoERP.Application.Finance.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/finance")]
[Authorize]
public class FinanceController(ISender mediator) : ControllerBase
{
    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts()
    {
        var result = await mediator.Send(new GetAccountsQuery());
        return Ok(result);
    }

    [HttpGet("vouchers")]
    public async Task<IActionResult> GetVouchers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await mediator.Send(new GetVouchersQuery(page, pageSize));
        return Ok(result);
    }

    [HttpPost("vouchers")]
    public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetVouchers), new { id }, new { id });
    }
}
