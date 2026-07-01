using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Commands;

public record DeleteDeveloperProjectCommand(Guid Id) : IRequest<bool>;

public class DeleteDeveloperProjectCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteDeveloperProjectCommand, bool>
{
    public async Task<bool> Handle(DeleteDeveloperProjectCommand request, CancellationToken cancellationToken)
    {
        var developerProject = await db.DeveloperProjects
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == currentUser.TenantId, cancellationToken);

        if (developerProject is null) return false;

        developerProject.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
