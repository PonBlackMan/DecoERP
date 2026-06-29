using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Finance.Queries;

public record GetVouchersQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResult<VoucherDto>>;

public record VoucherDto(
    Guid Id,
    string VoucherNo,
    DateOnly VoucherDate,
    string Description,
    string Status,
    DateTime CreatedAt);

public class GetVouchersQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetVouchersQuery, PagedResult<VoucherDto>>
{
    public async Task<PagedResult<VoucherDto>> Handle(GetVouchersQuery request, CancellationToken cancellationToken)
    {
        var query = db.Vouchers
            .Where(v => v.TenantId == currentUser.TenantId)
            .AsQueryable();

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(v => new VoucherDto(
                v.Id,
                v.VoucherNo,
                v.VoucherDate,
                v.Description,
                v.Status.ToString(),
                v.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<VoucherDto>(items, total, request.Page, request.PageSize);
    }
}
