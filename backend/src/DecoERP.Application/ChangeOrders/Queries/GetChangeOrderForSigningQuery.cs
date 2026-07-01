using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.ChangeOrders.Queries;

public record GetChangeOrderForSigningQuery(string Token) : IRequest<ChangeOrderSigningDto?>;

public record ChangeOrderSigningItemDto(
    string ItemName,
    string? Description,
    decimal UnitPrice,
    decimal Qty,
    decimal Amount);

public record ChangeOrderSigningDto(
    Guid Id,
    string OrderNo,
    string Reason,
    decimal TotalAmount,
    string Status,
    string ProjectName,
    DateTime ExpiresAt,
    bool AlreadySigned,
    IList<ChangeOrderSigningItemDto> Items);

public class GetChangeOrderForSigningQueryHandler(IDecoDbContext db)
    : IRequestHandler<GetChangeOrderForSigningQuery, ChangeOrderSigningDto?>
{
    public async Task<ChangeOrderSigningDto?> Handle(GetChangeOrderForSigningQuery request, CancellationToken cancellationToken)
    {
        var entity = await db.ChangeOrders
            .Include(co => co.Project)
            .Include(co => co.Items)
            .Include(co => co.Signoffs)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(co => co.SignToken == request.Token, cancellationToken);

        if (entity is null) return null;

        return new ChangeOrderSigningDto(
            entity.Id,
            entity.OrderNo,
            entity.Reason,
            entity.TotalAmount,
            entity.Status.ToString(),
            entity.Project.Name,
            entity.SignTokenExpiresAt ?? DateTime.UtcNow,
            entity.Signoffs.Any(),
            entity.Items
                .OrderBy(i => i.CreatedAt)
                .Select(i => new ChangeOrderSigningItemDto(i.ItemName, i.Description, i.UnitPrice, i.Qty, i.Amount))
                .ToList()
        );
    }
}
