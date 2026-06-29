using System.Security.Claims;
using DecoERP.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace DecoERP.Infrastructure.Identity;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public Guid UserId => Guid.Parse(User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());
    public Guid TenantId => Guid.Parse(User?.FindFirstValue("tenant_id") ?? Guid.Empty.ToString());
    public string Role => User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
}
