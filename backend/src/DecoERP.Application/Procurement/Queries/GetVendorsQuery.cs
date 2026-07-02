using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Procurement.Queries;

public record GetVendorsQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 50) : IRequest<PagedResult<VendorDto>>;

public record VendorDto(
    Guid Id,
    string Name,
    string Category,
    string? ContactName,
    string? Phone,
    string? Email,
    string? PaymentTerms,
    DateTime CreatedAt);

public class GetVendorsQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetVendorsQuery, PagedResult<VendorDto>>
{
    public async Task<PagedResult<VendorDto>> Handle(GetVendorsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Vendors
            .AsNoTracking()
            .Where(v => v.TenantId == currentUser.TenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(v => v.Name.Contains(request.Search) || (v.ContactName != null && v.ContactName.Contains(request.Search)));

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(v => new VendorDto(
                v.Id,
                v.Name,
                v.Category,
                v.ContactName,
                v.Phone,
                v.Email,
                v.PaymentTerms,
                v.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<VendorDto>(items, total, request.Page, request.PageSize);
    }
}
