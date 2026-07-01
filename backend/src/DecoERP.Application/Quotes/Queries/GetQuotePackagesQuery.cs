using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Quotes.Queries;

public record QuotePackageItemDto(
    Guid Id,
    string SpaceName,
    string Category,
    string ItemName,
    string Unit,
    decimal UnitPrice,
    decimal Qty,
    int SortOrder);

public record QuotePackageDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    IList<QuotePackageItemDto> Items);

public record GetQuotePackagesQuery(bool ActiveOnly = true) : IRequest<IList<QuotePackageDto>>;

public class GetQuotePackagesQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetQuotePackagesQuery, IList<QuotePackageDto>>
{
    public async Task<IList<QuotePackageDto>> Handle(GetQuotePackagesQuery request, CancellationToken cancellationToken)
    {
        var query = db.QuotePackages
            .AsNoTracking()
            .Where(p => p.TenantId == currentUser.TenantId)
            .AsQueryable();

        if (request.ActiveOnly)
            query = query.Where(p => p.IsActive);

        return await query
            .OrderBy(p => p.Name)
            .Select(p => new QuotePackageDto(
                p.Id,
                p.Name,
                p.Description,
                p.IsActive,
                p.Items
                    .OrderBy(i => i.SortOrder)
                    .Select(i => new QuotePackageItemDto(
                        i.Id, i.SpaceName, i.Category, i.ItemName,
                        i.Unit, i.UnitPrice, i.Qty, i.SortOrder))
                    .ToList()))
            .ToListAsync(cancellationToken);
    }
}
