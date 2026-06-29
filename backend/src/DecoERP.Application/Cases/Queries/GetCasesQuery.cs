using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Queries;

public record GetCasesQuery(
    CaseStage? Stage = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<CaseDto>>;

public record CaseDto(
    Guid Id,
    string ClientName,
    string? ClientPhone,
    string Stage,
    string Source,
    string? UnitNo,
    string? DeveloperProjectName,
    Guid? SalesRepId,
    DateTime CreatedAt);

public class GetCasesQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetCasesQuery, PagedResult<CaseDto>>
{
    public async Task<PagedResult<CaseDto>> Handle(GetCasesQuery request, CancellationToken cancellationToken)
    {
        var query = db.Cases
            .Where(c => c.TenantId == currentUser.TenantId)
            .Include(c => c.Unit).ThenInclude(u => u!.DeveloperProject)
            .AsQueryable();

        if (request.Stage.HasValue)
            query = query.Where(c => c.Stage == request.Stage.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(c => c.ClientName.Contains(request.Search));

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CaseDto(
                c.Id,
                c.ClientName,
                c.ClientPhone,
                c.Stage.ToString(),
                c.Source.ToString(),
                c.Unit != null ? c.Unit.UnitNo : null,
                c.Unit != null ? c.Unit.DeveloperProject.Name : null,
                c.SalesRepId,
                c.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<CaseDto>(items, total, request.Page, request.PageSize);
    }
}
