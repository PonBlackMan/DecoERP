using DecoERP.Application.Common.Interfaces;
using MediatR;

namespace DecoERP.Application.Portal.Commands;

public record VerifyPortalAccessCommand(string Token, string PhoneLastFour) : IRequest<PortalAccessResult>;

public class VerifyPortalAccessCommandHandler(IDecoDbContext db)
    : IRequestHandler<VerifyPortalAccessCommand, PortalAccessResult>
{
    public async Task<PortalAccessResult> Handle(VerifyPortalAccessCommand request, CancellationToken cancellationToken)
    {
        var (result, _) = await PortalAccessGuard.ValidateAsync(db, request.Token, request.PhoneLastFour, cancellationToken);
        return result;
    }
}
