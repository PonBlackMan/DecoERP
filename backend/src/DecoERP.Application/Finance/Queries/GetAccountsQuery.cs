using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Finance.Queries;

public record GetAccountsQuery() : IRequest<List<AccountDto>>;

public record AccountDto(Guid Id, string Code, string Name, string Type);

public class GetAccountsQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetAccountsQuery, List<AccountDto>>
{
    public async Task<List<AccountDto>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        return await db.Accounts
            .Where(a => a.TenantId == currentUser.TenantId)
            .OrderBy(a => a.Code)
            .Select(a => new AccountDto(a.Id, a.Code, a.Name, a.Type.ToString()))
            .ToListAsync(cancellationToken);
    }
}
