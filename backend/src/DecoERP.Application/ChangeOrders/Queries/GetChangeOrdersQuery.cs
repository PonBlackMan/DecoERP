using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.ChangeOrders.Queries;

public record GetChangeOrdersQuery(
    Guid? ProjectId = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ChangeOrderDto>>;

public record ChangeOrderDto(
    Guid Id,
    Guid ProjectId,
    string? ProjectName,
    string OrderNo,
    string Reason,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    string? SignToken,
    DateTime? SignTokenExpiresAt);

public class GetChangeOrdersQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetChangeOrdersQuery, PagedResult<ChangeOrderDto>>
{
    public async Task<PagedResult<ChangeOrderDto>> Handle(GetChangeOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = db.ChangeOrders
            .Where(co => co.TenantId == currentUser.TenantId)
            .Include(co => co.Project)
            .AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(co => co.ProjectId == request.ProjectId.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(co => co.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(co => new ChangeOrderDto(
                co.Id,
                co.ProjectId,
                co.Project.Name,
                co.OrderNo,
                co.Reason,
                co.Status.ToString(),
                co.TotalAmount,
                co.CreatedAt,
                co.SignToken,
                co.SignTokenExpiresAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<ChangeOrderDto>(items, total, request.Page, request.PageSize);
    }
}
