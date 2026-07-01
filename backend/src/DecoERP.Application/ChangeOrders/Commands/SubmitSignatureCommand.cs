using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.ChangeOrders;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.ChangeOrders.Commands;

public enum SubmitSignatureResult { Success, NotFound, Expired, AlreadySigned, PhoneMismatch }

public record SubmitSignatureCommand(
    string Token,
    string ClientPhoneLastFour,
    string SignatureData,
    string? IpAddress = null) : IRequest<SubmitSignatureResult>;

public class SubmitSignatureCommandHandler(IDecoDbContext db)
    : IRequestHandler<SubmitSignatureCommand, SubmitSignatureResult>
{
    public async Task<SubmitSignatureResult> Handle(SubmitSignatureCommand request, CancellationToken cancellationToken)
    {
        var entity = await db.ChangeOrders
            .Include(co => co.Signoffs)
            .FirstOrDefaultAsync(co => co.SignToken == request.Token, cancellationToken);

        if (entity is null) return SubmitSignatureResult.NotFound;
        if (entity.SignTokenExpiresAt < DateTime.UtcNow) return SubmitSignatureResult.Expired;
        if (entity.Signoffs.Any()) return SubmitSignatureResult.AlreadySigned;
        if (entity.SignClientPhoneLastFour != request.ClientPhoneLastFour) return SubmitSignatureResult.PhoneMismatch;

        entity.Signoffs.Add(new ChangeOrderSignoff
        {
            TenantId = entity.TenantId,
            ChangeOrderId = entity.Id,
            SignedBy = "客戶簽認",
            SignedAt = DateTime.UtcNow,
            SignatureData = request.SignatureData,
            ClientPhoneLastFour = request.ClientPhoneLastFour,
            IpAddress = request.IpAddress,
        });

        entity.Status = ChangeOrderStatus.Signed;
        await db.SaveChangesAsync(cancellationToken);
        return SubmitSignatureResult.Success;
    }
}
