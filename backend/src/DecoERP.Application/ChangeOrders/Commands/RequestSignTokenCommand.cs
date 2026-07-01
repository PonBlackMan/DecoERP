using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.ChangeOrders.Commands;

public record RequestSignTokenCommand(
    Guid ChangeOrderId,
    string ClientPhoneLastFour,
    int ExpiresInDays = 7) : IRequest<RequestSignTokenResult?>;

public record RequestSignTokenResult(string Token, DateTime ExpiresAt);

public class RequestSignTokenCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<RequestSignTokenCommand, RequestSignTokenResult?>
{
    public async Task<RequestSignTokenResult?> Handle(RequestSignTokenCommand request, CancellationToken cancellationToken)
    {
        var entity = await db.ChangeOrders
            .FirstOrDefaultAsync(co => co.Id == request.ChangeOrderId && co.TenantId == currentUser.TenantId, cancellationToken);

        if (entity is null) return null;

        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(request.ExpiresInDays);

        entity.SignToken = token;
        entity.SignTokenExpiresAt = expiresAt;
        entity.SignClientPhoneLastFour = request.ClientPhoneLastFour;
        entity.Status = ChangeOrderStatus.PendingSign;

        await db.SaveChangesAsync(cancellationToken);
        return new RequestSignTokenResult(token, expiresAt);
    }
}
