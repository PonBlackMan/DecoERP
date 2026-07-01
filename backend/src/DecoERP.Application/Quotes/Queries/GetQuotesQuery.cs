using DecoERP.Application.Common.Interfaces;
using DecoERP.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Quotes.Queries;

public record GetQuotesQuery(Guid? CaseId = null, int Page = 1, int PageSize = 20)
    : IRequest<PagedResult<QuoteSummaryDto>>;

public record QuoteSummaryDto(
    Guid Id,
    string QuoteNo,
    int Version,
    string Status,
    decimal TotalAmount,
    DateTime? ValidUntil,
    Guid CaseId,
    string ClientName,
    DateTime CreatedAt,
    string? SignToken);

public class GetQuotesQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetQuotesQuery, PagedResult<QuoteSummaryDto>>
{
    public async Task<PagedResult<QuoteSummaryDto>> Handle(GetQuotesQuery request, CancellationToken cancellationToken)
    {
        var query = db.Quotes
            .Where(q => q.TenantId == currentUser.TenantId)
            .Include(q => q.Case)
            .AsQueryable();

        if (request.CaseId.HasValue)
            query = query.Where(q => q.CaseId == request.CaseId.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(q => new QuoteSummaryDto(
                q.Id, q.QuoteNo, q.Version, q.Status.ToString(),
                q.TotalAmount, q.ValidUntil, q.CaseId, q.Case.ClientName, q.CreatedAt, q.SignToken))
            .ToListAsync(cancellationToken);

        return new PagedResult<QuoteSummaryDto>(items, total, request.Page, request.PageSize);
    }
}
