using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Projects.Queries;

public record InvoiceReceivableDto(
    Guid Id,
    Guid ProjectId,
    string ProjectName,
    string InvoiceNo,
    decimal Amount,
    decimal PaidAmount,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    string Status,
    string? Notes);

public record GetInvoiceReceivablesQuery(
    Guid? ProjectId = null,
    bool OverdueOnly = false) : IRequest<IList<InvoiceReceivableDto>>;

public class GetInvoiceReceivablesQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetInvoiceReceivablesQuery, IList<InvoiceReceivableDto>>
{
    public async Task<IList<InvoiceReceivableDto>> Handle(GetInvoiceReceivablesQuery request, CancellationToken cancellationToken)
    {
        var query = db.InvoicesReceivable
            .Where(i => i.TenantId == currentUser.TenantId)
            .Include(i => i.Project)
            .AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(i => i.ProjectId == request.ProjectId.Value);

        if (request.OverdueOnly)
            query = query.Where(i => i.Status == Domain.Enums.InvoiceStatus.Overdue);

        return await query
            .OrderBy(i => i.Status == Domain.Enums.InvoiceStatus.Overdue ? 0 : 1)
            .ThenBy(i => i.DueDate)
            .Select(i => new InvoiceReceivableDto(
                i.Id,
                i.ProjectId,
                i.Project.Name,
                i.InvoiceNo,
                i.Amount,
                i.PaidAmount,
                i.InvoiceDate,
                i.DueDate,
                i.Status.ToString(),
                i.Notes))
            .ToListAsync(cancellationToken);
    }
}
