using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Cases;
using DecoERP.Domain.Enums;
using MediatR;

namespace DecoERP.Application.Cases.Commands;

public record CreateCaseCommand(
    string ClientName,
    string? ClientPhone,
    string? ClientEmail,
    string? Requirements,
    CaseSource Source,
    Guid? UnitId,
    Guid? SalesRepId) : IRequest<Guid>;

public class CreateCaseCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateCaseCommand, Guid>
{
    public async Task<Guid> Handle(CreateCaseCommand request, CancellationToken cancellationToken)
    {
        var @case = new Case
        {
            TenantId = currentUser.TenantId,
            ClientName = request.ClientName,
            ClientPhone = request.ClientPhone,
            ClientEmail = request.ClientEmail,
            Requirements = request.Requirements,
            Source = request.Source,
            UnitId = request.UnitId,
            SalesRepId = request.SalesRepId,
            Stage = CaseStage.Negotiating
        };

        db.Cases.Add(@case);
        await db.SaveChangesAsync(cancellationToken);
        return @case.Id;
    }
}
