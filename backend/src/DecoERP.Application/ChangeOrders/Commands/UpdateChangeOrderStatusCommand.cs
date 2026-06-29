using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.ChangeOrders.Commands;

public record UpdateChangeOrderStatusCommand(Guid Id, ChangeOrderStatus Status) : IRequest<bool>;

public class UpdateChangeOrderStatusCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateChangeOrderStatusCommand, bool>
{
    public async Task<bool> Handle(UpdateChangeOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await db.ChangeOrders
            .FirstOrDefaultAsync(co => co.Id == request.Id && co.TenantId == currentUser.TenantId, cancellationToken);

        if (entity is null)
            return false;

        entity.Status = request.Status;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
