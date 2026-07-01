using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Quotes.Commands;

public record DeleteQuotePackageCommand(Guid Id) : IRequest<bool>;

public class DeleteQuotePackageCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteQuotePackageCommand, bool>
{
    public async Task<bool> Handle(DeleteQuotePackageCommand request, CancellationToken cancellationToken)
    {
        var package = await db.QuotePackages
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == currentUser.TenantId, cancellationToken);

        if (package is null) return false;

        package.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
