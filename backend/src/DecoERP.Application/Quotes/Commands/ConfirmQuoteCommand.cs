using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Quotes.Commands;

public record ConfirmQuoteCommand(Guid QuoteId) : IRequest<bool>;

public class ConfirmQuoteCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<ConfirmQuoteCommand, bool>
{
    public async Task<bool> Handle(ConfirmQuoteCommand request, CancellationToken cancellationToken)
    {
        var quote = await db.Quotes
            .FirstOrDefaultAsync(q => q.Id == request.QuoteId && q.TenantId == currentUser.TenantId, cancellationToken);

        if (quote is null) return false;

        quote.Status = QuoteStatus.Confirmed;

        // 更新案件階段到已簽約
        var @case = await db.Cases.FindAsync([quote.CaseId], cancellationToken);
        if (@case is not null)
            @case.Stage = CaseStage.Contracted;

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
