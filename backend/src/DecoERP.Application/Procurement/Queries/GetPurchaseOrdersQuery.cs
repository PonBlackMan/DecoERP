using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Procurement.Queries;

public record GetPurchaseOrdersQuery(
    Guid? VendorId = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<PurchaseOrderDto>>;

public record PurchaseOrderDto(
    Guid Id,
    Guid VendorId,
    string VendorName,
    string PoNumber,
    string Status,
    decimal TotalAmount,
    DateOnly? ExpectedDate,
    DateTime CreatedAt);

public class GetPurchaseOrdersQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetPurchaseOrdersQuery, PagedResult<PurchaseOrderDto>>
{
    public async Task<PagedResult<PurchaseOrderDto>> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = db.PurchaseOrders
            .AsNoTracking()
            .Where(po => po.TenantId == currentUser.TenantId)
            .Include(po => po.Vendor)
            .AsQueryable();

        if (request.VendorId.HasValue)
            query = query.Where(po => po.VendorId == request.VendorId.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(po => po.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(po => new PurchaseOrderDto(
                po.Id,
                po.VendorId,
                po.Vendor.Name,
                po.PoNumber,
                po.Status.ToString(),
                po.TotalAmount,
                po.ExpectedDate,
                po.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<PurchaseOrderDto>(items, total, request.Page, request.PageSize);
    }
}
