using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Quotes;
using MediatR;

namespace DecoERP.Application.Quotes.Commands;

public record QuotePackageItemInput(
    string SpaceName,
    string Category,
    string ItemName,
    string Unit,
    decimal UnitPrice,
    decimal Qty,
    int SortOrder);

public record CreateQuotePackageCommand(
    string Name,
    string? Description,
    IList<QuotePackageItemInput> Items) : IRequest<Guid>;

public class CreateQuotePackageCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateQuotePackageCommand, Guid>
{
    public async Task<Guid> Handle(CreateQuotePackageCommand request, CancellationToken cancellationToken)
    {
        var package = new QuotePackage
        {
            TenantId = currentUser.TenantId,
            Name = request.Name,
            Description = request.Description,
            IsActive = true,
        };

        foreach (var item in request.Items)
        {
            package.Items.Add(new QuotePackageItem
            {
                TenantId = currentUser.TenantId,
                SpaceName = item.SpaceName,
                Category = item.Category,
                ItemName = item.ItemName,
                Unit = item.Unit,
                UnitPrice = item.UnitPrice,
                Qty = item.Qty,
                SortOrder = item.SortOrder,
            });
        }

        db.QuotePackages.Add(package);
        await db.SaveChangesAsync(cancellationToken);
        return package.Id;
    }
}
