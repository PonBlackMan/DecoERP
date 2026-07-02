using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.HR.Queries;

public record GetEmployeesQuery(
    bool? IsActive = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<EmployeeDto>>;

public record EmployeeDto(
    Guid Id,
    string FullName,
    string JobTitle,
    string Department,
    string? Phone,
    string? Email,
    bool IsActive,
    decimal BaseSalary,
    DateOnly HireDate,
    DateTime CreatedAt);

public class GetEmployeesQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetEmployeesQuery, PagedResult<EmployeeDto>>
{
    public async Task<PagedResult<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        var query = db.Employees
            .AsNoTracking()
            .Where(e => e.TenantId == currentUser.TenantId)
            .AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(e => e.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(e => e.FullName.Contains(request.Search) || e.Department.Contains(request.Search) || e.JobTitle.Contains(request.Search));

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EmployeeDto(
                e.Id,
                e.FullName,
                e.JobTitle,
                e.Department,
                e.Phone,
                e.Email,
                e.IsActive,
                e.BaseSalary,
                e.HireDate,
                e.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<EmployeeDto>(items, total, request.Page, request.PageSize);
    }
}
