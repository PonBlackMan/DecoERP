using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Projects.Queries;

public record GetProjectsQuery(
    ProjectStatus? Status = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ProjectDto>>;

public record ProjectDto(
    Guid Id,
    string Code,
    string Name,
    string OwnerName,
    string? OwnerPhone,
    decimal ContractAmount,
    string Status,
    DateTime? StartDate,
    DateTime? EndDate,
    string? Address,
    DateTime CreatedAt);

public class GetProjectsQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetProjectsQuery, PagedResult<ProjectDto>>
{
    public async Task<PagedResult<ProjectDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Projects
            .Where(p => p.TenantId == currentUser.TenantId)
            .AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(p => p.Name.Contains(request.Search) || p.OwnerName.Contains(request.Search) || p.Code.Contains(request.Search));

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProjectDto(
                p.Id,
                p.Code,
                p.Name,
                p.OwnerName,
                p.OwnerPhone,
                p.ContractAmount,
                p.Status.ToString(),
                p.StartDate,
                p.EndDate,
                p.Address,
                p.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<ProjectDto>(items, total, request.Page, request.PageSize);
    }
}
