using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Queries;

public record DeveloperProjectDto(
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
    bool IsActive,
    int UnitCount);

public record GetDeveloperProjectsQuery(bool ActiveOnly = false) : IRequest<IList<DeveloperProjectDto>>;

public class GetDeveloperProjectsQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetDeveloperProjectsQuery, IList<DeveloperProjectDto>>
{
    public async Task<IList<DeveloperProjectDto>> Handle(GetDeveloperProjectsQuery request, CancellationToken cancellationToken)
    {
        var query = db.DeveloperProjects
            .AsNoTracking()
            .Where(p => p.TenantId == currentUser.TenantId)
            .AsQueryable();

        if (request.ActiveOnly)
            query = query.Where(p => p.IsActive);

        return await query
            .OrderBy(p => p.Name)
            .Select(p => new DeveloperProjectDto(
                p.Id,
                p.Name,
                p.DeveloperName,
                p.Address,
                p.Notes,
                p.ContactName,
                p.ContactPhone,
                p.ContactEmail,
                p.CommissionRatePercent,
                p.DeliveryRequirements,
                p.BrandStandards,
                p.IsActive,
                p.Units.Count))
            .ToListAsync(cancellationToken);
    }
}
