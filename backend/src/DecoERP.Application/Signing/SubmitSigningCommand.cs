using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.ChangeOrders;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Signing;

public enum SigningResult { Success, NotFound, Expired, AlreadySigned, PhoneMismatch }

public record SubmitSigningCommand(
    string Token,
    string ClientPhoneLastFour,
    string SignatureData,
    string? IpAddress = null) : IRequest<SigningResult>;

public class SubmitSigningCommandHandler(IDecoDbContext db)
    : IRequestHandler<SubmitSigningCommand, SigningResult>
{
    public async Task<SigningResult> Handle(SubmitSigningCommand request, CancellationToken cancellationToken)
    {
        // Try ChangeOrder
        var co = await db.ChangeOrders
            .Include(x => x.Signoffs)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.SignToken == request.Token, cancellationToken);

        if (co is not null)
        {
            if (co.SignTokenExpiresAt < DateTime.UtcNow) return SigningResult.Expired;
            if (co.Signoffs.Any()) return SigningResult.AlreadySigned;
            if (co.SignClientPhoneLastFour != request.ClientPhoneLastFour) return SigningResult.PhoneMismatch;

            co.Signoffs.Add(new ChangeOrderSignoff
            {
                TenantId = co.TenantId,
                ChangeOrderId = co.Id,
                SignedBy = "客戶簽認",
                SignedAt = DateTime.UtcNow,
                SignatureData = request.SignatureData,
                ClientPhoneLastFour = request.ClientPhoneLastFour,
                IpAddress = request.IpAddress,
            });
            co.Status = ChangeOrderStatus.Signed;
            await db.SaveChangesAsync(cancellationToken);
            return SigningResult.Success;
        }

        // Try Quote
        var quote = await db.Quotes
            .Include(x => x.Case)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.SignToken == request.Token, cancellationToken);

        if (quote is not null)
        {
            if (quote.SignTokenExpiresAt < DateTime.UtcNow) return SigningResult.Expired;
            if (quote.SignedAt.HasValue) return SigningResult.AlreadySigned;
            if (quote.SignClientPhoneLastFour != request.ClientPhoneLastFour) return SigningResult.PhoneMismatch;

            quote.ClientSignatureData = request.SignatureData;
            quote.SignedAt = DateTime.UtcNow;
            quote.SignerIpAddress = request.IpAddress;
            quote.Status = QuoteStatus.Confirmed;

            if (quote.Case is not null)
                quote.Case.Stage = CaseStage.Contracted;

            await db.SaveChangesAsync(cancellationToken);
            return SigningResult.Success;
        }

        return SigningResult.NotFound;
    }
}
