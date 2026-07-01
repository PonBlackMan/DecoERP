using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Signing;

public record GetSigningInfoQuery(string Token) : IRequest<SigningInfoDto?>;

public record SigningItemDto(string Name, string? Description, decimal UnitPrice, decimal Qty, decimal Amount);

public record SigningInfoDto(
    string EntityType,   // "Quote" | "ChangeOrder"
    string RefNo,
    string Description,
    decimal TotalAmount,
    string SubjectName,
    DateTime ExpiresAt,
    bool AlreadySigned,
    IList<SigningItemDto> Items);

public class GetSigningInfoQueryHandler(IDecoDbContext db)
    : IRequestHandler<GetSigningInfoQuery, SigningInfoDto?>
{
    public async Task<SigningInfoDto?> Handle(GetSigningInfoQuery request, CancellationToken cancellationToken)
    {
        // Try ChangeOrder first
        var co = await db.ChangeOrders
            .Include(x => x.Project)
            .Include(x => x.Items)
            .Include(x => x.Signoffs)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.SignToken == request.Token, cancellationToken);

        if (co is not null)
            return new SigningInfoDto(
                "ChangeOrder",
                co.OrderNo,
                co.Reason,
                co.TotalAmount,
                co.Project.Name,
                co.SignTokenExpiresAt ?? DateTime.UtcNow,
                co.Signoffs.Any(),
                co.Items.OrderBy(i => i.CreatedAt)
                    .Select(i => new SigningItemDto(i.ItemName, i.Description, i.UnitPrice, i.Qty, i.Amount))
                    .ToList());

        // Try Quote
        var quote = await db.Quotes
            .Include(x => x.Case)
            .Include(x => x.Items)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.SignToken == request.Token, cancellationToken);

        if (quote is not null)
            return new SigningInfoDto(
                "Quote",
                quote.QuoteNo,
                quote.Notes ?? "",
                quote.TotalAmount,
                quote.Case.ClientName,
                quote.SignTokenExpiresAt ?? DateTime.UtcNow,
                quote.SignedAt.HasValue,
                quote.Items.OrderBy(i => i.SortOrder)
                    .Select(i => new SigningItemDto(
                        $"[{i.SpaceName}] {i.Category} {i.ItemName}",
                        null, i.UnitPrice, i.Qty, i.UnitPrice * i.Qty))
                    .ToList());

        return null;
    }
}
