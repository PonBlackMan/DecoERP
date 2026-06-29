using DecoERP.Domain.Entities.Users;

namespace DecoERP.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
