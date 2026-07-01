using DecoERP.Application.Portal;
using DecoERP.Application.Portal.Commands;
using DecoERP.Application.Portal.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DecoERP.Api.Controllers;

[ApiController]
[Route("api/portal")]
[AllowAnonymous]
public class PortalController(ISender mediator) : ControllerBase
{
    [HttpPost("{token}/verify")]
    public async Task<IActionResult> Verify(string token, [FromBody] PortalAccessRequest request)
    {
        var result = await mediator.Send(new VerifyPortalAccessCommand(token, request.PhoneLastFour));
        return ToActionResult(result);
    }

    [HttpPost("{token}/data")]
    public async Task<IActionResult> GetData(string token, [FromBody] PortalAccessRequest request)
    {
        var (result, data) = await mediator.Send(new GetPortalDataQuery(token, request.PhoneLastFour));
        return result == PortalAccessResult.Success ? Ok(data) : ToActionResult(result);
    }

    private IActionResult ToActionResult(PortalAccessResult result) => result switch
    {
        PortalAccessResult.Success => Ok(),
        PortalAccessResult.NotFound => NotFound(new { error = "連結不存在" }),
        PortalAccessResult.Expired => BadRequest(new { error = "連結已過期，請聯繫工程人員重新發送" }),
        PortalAccessResult.Locked => StatusCode(423, new { error = "驗證錯誤次數過多，請 15 分鐘後再試" }),
        PortalAccessResult.PhoneMismatch => BadRequest(new { error = "電話末四碼不符，請確認後再試" }),
        _ => StatusCode(500, new { error = "系統錯誤" }),
    };
}

public record PortalAccessRequest(string PhoneLastFour);
