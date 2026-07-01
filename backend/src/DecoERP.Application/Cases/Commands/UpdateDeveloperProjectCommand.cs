using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Commands;

public record UpdateDeveloperProjectCommand(
    Guid Id,
    string Name,
    string DeveloperName,
    string? Address,
    string? Notes,
    string? ContactName,
    string? ContactPhone,
    string? ContactEmail,
    decimal? CommissionRatePercent,
    string? DeliveryRequirements,
    string? BrandStandards,
    bool IsActive) : IRequest<bool>;

public class UpdateDeveloperProjectCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateDeveloperProjectCommand, bool>
{
    public async Task<bool> Handle(UpdateDeveloperProjectCommand request, CancellationToken cancellationToken)
    {
        var developerProject = await db.DeveloperProjects
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == currentUser.TenantId, cancellationToken);

        if (developerProject is null) return false;

        developerProject.Name = request.Name;
        developerProject.DeveloperName = request.DeveloperName;
        developerProject.Address = request.Address;
        developerProject.Notes = request.Notes;
        developerProject.ContactName = request.ContactName;
        developerProject.ContactPhone = request.ContactPhone;
        developerProject.ContactEmail = request.ContactEmail;
        developerProject.CommissionRatePercent = request.CommissionRatePercent;
        developerProject.DeliveryRequirements = request.DeliveryRequirements;
        developerProject.BrandStandards = request.BrandStandards;
        developerProject.IsActive = request.IsActive;

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
