using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Signing;

public record RequestQuoteSignTokenCommand(
    Guid QuoteId,
    string ClientPhoneLastFour,
    int ExpiresInDays = 7) : IRequest<RequestSignTokenResult?>;

public record RequestSignTokenResult(string Token, DateTime ExpiresAt);

public class RequestQuoteSignTokenCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<RequestQuoteSignTokenCommand, RequestSignTokenResult?>
{
    public async Task<RequestSignTokenResult?> Handle(RequestQuoteSignTokenCommand request, CancellationToken cancellationToken)
    {
        var quote = await db.Quotes
            .FirstOrDefaultAsync(q => q.Id == request.QuoteId && q.TenantId == currentUser.TenantId, cancellationToken);

        if (quote is null) return null;

        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(request.ExpiresInDays);

        quote.SignToken = token;
        quote.SignTokenExpiresAt = expiresAt;
        quote.SignClientPhoneLastFour = request.ClientPhoneLastFour;

        await db.SaveChangesAsync(cancellationToken);
        return new RequestSignTokenResult(token, expiresAt);
    }
}
