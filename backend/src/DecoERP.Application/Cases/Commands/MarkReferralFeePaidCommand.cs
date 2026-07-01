using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Commands;

public record MarkReferralFeePaidCommand(Guid CaseId) : IRequest<bool>;

public class MarkReferralFeePaidCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<MarkReferralFeePaidCommand, bool>
{
    public async Task<bool> Handle(MarkReferralFeePaidCommand request, CancellationToken cancellationToken)
    {
        var @case = await db.Cases
            .FirstOrDefaultAsync(c => c.Id == request.CaseId && c.TenantId == currentUser.TenantId, cancellationToken);

        if (@case is null || @case.ReferrerName is null) return false;

        @case.ReferralFeePaid = true;
        @case.ReferralFeePaidAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
