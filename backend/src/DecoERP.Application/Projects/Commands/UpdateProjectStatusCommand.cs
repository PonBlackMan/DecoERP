using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Projects.Commands;

public record UpdateProjectStatusCommand(Guid Id, ProjectStatus Status) : IRequest<bool>;

public class UpdateProjectStatusCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateProjectStatusCommand, bool>
{
    public async Task<bool> Handle(UpdateProjectStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == currentUser.TenantId, cancellationToken);

        if (entity is null)
            return false;

        entity.Status = request.Status;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
