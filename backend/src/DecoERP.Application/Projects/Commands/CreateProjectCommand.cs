using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Projects;
using DecoERP.Domain.Enums;
using MediatR;

namespace DecoERP.Application.Projects.Commands;

public record CreateProjectCommand(
    string Code,
    string Name,
    string OwnerName,
    string? OwnerPhone,
    decimal ContractAmount,
    DateTime? StartDate,
    DateTime? EndDate,
    string? Address,
    string? Notes) : IRequest<Guid>;

public class CreateProjectCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateProjectCommand, Guid>
{
    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var entity = new Project
        {
            TenantId = currentUser.TenantId,
            Code = request.Code,
            Name = request.Name,
            OwnerName = request.OwnerName,
            OwnerPhone = request.OwnerPhone,
            ContractAmount = request.ContractAmount,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Address = request.Address,
            Notes = request.Notes,
            Status = ProjectStatus.Contracted
        };

        db.Projects.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
