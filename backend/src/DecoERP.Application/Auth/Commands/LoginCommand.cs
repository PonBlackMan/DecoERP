using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<LoginResult?>;

public record LoginResult(string Token, Guid UserId, string FullName, string Role, Guid TenantId);

public class LoginCommandHandler(IDecoDbContext db, IJwtService jwt) : IRequestHandler<LoginCommand, LoginResult?>
{
    public async Task<LoginResult?> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = jwt.GenerateToken(user);
        return new LoginResult(token, user.Id, user.FullName, user.Role.ToString(), user.TenantId);
    }
}
