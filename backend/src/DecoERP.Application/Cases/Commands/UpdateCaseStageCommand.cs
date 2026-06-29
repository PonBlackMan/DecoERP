using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Commands;

public record UpdateCaseStageCommand(Guid CaseId, CaseStage NewStage) : IRequest<bool>;

public class UpdateCaseStageCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateCaseStageCommand, bool>
{
    public async Task<bool> Handle(UpdateCaseStageCommand request, CancellationToken cancellationToken)
    {
        var @case = await db.Cases
            .FirstOrDefaultAsync(c => c.Id == request.CaseId && c.TenantId == currentUser.TenantId, cancellationToken);

        if (@case is null) return false;

        @case.Stage = request.NewStage;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
