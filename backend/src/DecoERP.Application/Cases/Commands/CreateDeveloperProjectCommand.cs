using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Cases;
using MediatR;

namespace DecoERP.Application.Cases.Commands;

public record CreateDeveloperProjectCommand(
    string Name,
    string DeveloperName,
    string? Address,
    string? Notes,
    string? ContactName,
    string? ContactPhone,
    string? ContactEmail,
    decimal? CommissionRatePercent,
    string? DeliveryRequirements,
    string? BrandStandards) : IRequest<Guid>;

public class CreateDeveloperProjectCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateDeveloperProjectCommand, Guid>
{
    public async Task<Guid> Handle(CreateDeveloperProjectCommand request, CancellationToken cancellationToken)
    {
        var developerProject = new DeveloperProject
        {
            TenantId = currentUser.TenantId,
            Name = request.Name,
            DeveloperName = request.DeveloperName,
            Address = request.Address,
            Notes = request.Notes,
            ContactName = request.ContactName,
            ContactPhone = request.ContactPhone,
            ContactEmail = request.ContactEmail,
            CommissionRatePercent = request.CommissionRatePercent,
            DeliveryRequirements = request.DeliveryRequirements,
            BrandStandards = request.BrandStandards,
        };

        db.DeveloperProjects.Add(developerProject);
        await db.SaveChangesAsync(cancellationToken);
        return developerProject.Id;
    }
}
