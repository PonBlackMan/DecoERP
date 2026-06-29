using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Quotes;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Quotes.Commands;

public record QuoteItemInput(
    string SpaceName,
    string Category,
    string ItemName,
    string Unit,
    decimal UnitPrice,
    decimal Qty,
    string? Remark,
    int SortOrder);

public record CreateQuoteCommand(
    Guid CaseId,
    DateTime? ValidUntil,
    string? Notes,
    IList<QuoteItemInput> Items) : IRequest<Guid>;

public class CreateQuoteCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateQuoteCommand, Guid>
{
    public async Task<Guid> Handle(CreateQuoteCommand request, CancellationToken cancellationToken)
    {
        var lastVersion = await db.Quotes
            .Where(q => q.CaseId == request.CaseId && q.TenantId == currentUser.TenantId)
            .MaxAsync(q => (int?)q.Version, cancellationToken) ?? 0;

        var quoteNo = $"Q-{DateTime.UtcNow:yyyyMMdd}-{currentUser.TenantId.ToString()[..4].ToUpper()}";

        var quote = new Quote
        {
            TenantId = currentUser.TenantId,
            CaseId = request.CaseId,
            QuoteNo = quoteNo,
            Version = lastVersion + 1,
            ValidUntil = request.ValidUntil,
            Notes = request.Notes,
            Status = QuoteStatus.Draft
        };

        foreach (var item in request.Items)
        {
            var subtotal = item.UnitPrice * item.Qty;
            quote.Items.Add(new QuoteItem
            {
                TenantId = currentUser.TenantId,
                SpaceName = item.SpaceName,
                Category = item.Category,
                ItemName = item.ItemName,
                Unit = item.Unit,
                UnitPrice = item.UnitPrice,
                Qty = item.Qty,
                Subtotal = subtotal,
                Remark = item.Remark,
                SortOrder = item.SortOrder
            });
        }

        quote.TotalAmount = quote.Items.Sum(i => i.Subtotal);
        db.Quotes.Add(quote);
        await db.SaveChangesAsync(cancellationToken);
        return quote.Id;
    }
}
