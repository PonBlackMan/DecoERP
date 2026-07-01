using DecoERP.Application.ChangeOrders.Commands;
using DecoERP.Application.ChangeOrders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/signing")]
[AllowAnonymous]
public class SigningController(ISender mediator) : ControllerBase
{
    [HttpGet("{token}")]
    public async Task<IActionResult> Get(string token)
    {
        var result = await mediator.Send(new GetChangeOrderForSigningQuery(token));
        return result is null ? NotFound(new { error = "連結不存在或已失效" }) : Ok(result);
    }

    [HttpPost("{token}")]
    public async Task<IActionResult> Submit(string token, [FromBody] SubmitSignatureRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await mediator.Send(new SubmitSignatureCommand(token, request.PhoneLastFour, request.SignatureData, ip));

        return result switch
        {
            SubmitSignatureResult.Success => Ok(new { message = "簽認成功" }),
            SubmitSignatureResult.NotFound => NotFound(new { error = "連結不存在" }),
            SubmitSignatureResult.Expired => BadRequest(new { error = "連結已過期，請聯繫工程人員重新發送" }),
            SubmitSignatureResult.AlreadySigned => Conflict(new { error = "此變更單已完成簽認" }),
            SubmitSignatureResult.PhoneMismatch => BadRequest(new { error = "電話末四碼不符，請確認後再試" }),
            _ => StatusCode(500, new { error = "系統錯誤" }),
        };
    }
}

public record SubmitSignatureRequest(string PhoneLastFour, string SignatureData);
