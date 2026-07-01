using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Portal.Queries;

public record PortalProjectDto(
    string Code,
    string Name,
    string Status,
    string OwnerName,
    string? Address,
    DateTime? StartDate,
    DateTime? EndDate,
    int OverallProgressPct);

public record PortalTaskDto(
    string Name,
    DateTime? PlannedStart,
    DateTime? PlannedEnd,
    DateTime? ActualEnd,
    int ProgressPct);

public record PortalSiteReportDto(
    DateOnly ReportDate,
    string? Weather,
    int WorkersCount,
    string Notes);

public record PortalIssueDto(
    string Title,
    string? Description,
    string Status,
    DateTime? DueDate,
    string? Resolution);

public record PortalInspectionDto(
    DateOnly InspectionDate,
    string Status,
    string? SignedBy,
    DateTime? SignedAt,
    string? Notes);

public record PortalChangeOrderItemDto(
    string ItemName,
    string? Description,
    decimal Amount);

public record PortalChangeOrderDto(
    string OrderNo,
    string Reason,
    string Status,
    decimal TotalAmount,
    bool CanSign,
    string? SignToken,
    IList<PortalChangeOrderItemDto> Items);

public record PortalInvoiceDto(
    string InvoiceNo,
    decimal Amount,
    decimal PaidAmount,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    string Status);

public record PortalDataDto(
    PortalProjectDto Project,
    IList<PortalTaskDto> Tasks,
    IList<PortalSiteReportDto> SiteReports,
    IList<PortalIssueDto> Issues,
    IList<PortalInspectionDto> Inspections,
    IList<PortalChangeOrderDto> ChangeOrders,
    IList<PortalInvoiceDto> Invoices);

public record GetPortalDataQuery(string Token, string PhoneLastFour) : IRequest<(PortalAccessResult Result, PortalDataDto? Data)>;

public class GetPortalDataQueryHandler(IDecoDbContext db)
    : IRequestHandler<GetPortalDataQuery, (PortalAccessResult Result, PortalDataDto? Data)>
{
    public async Task<(PortalAccessResult Result, PortalDataDto? Data)> Handle(GetPortalDataQuery request, CancellationToken cancellationToken)
    {
        var (result, project) = await PortalAccessGuard.ValidateAsync(db, request.Token, request.PhoneLastFour, cancellationToken);
        if (result != PortalAccessResult.Success || project is null) return (result, null);

        var tasks = await db.ProjectTasks
            .Where(t => t.ProjectId == project.Id)
            .OrderBy(t => t.PlannedStart)
            .Select(t => new PortalTaskDto(t.Name, t.PlannedStart, t.PlannedEnd, t.ActualEnd, t.ProgressPct))
            .ToListAsync(cancellationToken);

        var siteReports = await db.SiteReports
            .Where(s => s.ProjectId == project.Id)
            .OrderByDescending(s => s.ReportDate)
            .Take(30)
            .Select(s => new PortalSiteReportDto(s.ReportDate, s.Weather, s.WorkersCount, s.Notes))
            .ToListAsync(cancellationToken);

        var issues = await db.Issues
            .Where(i => i.ProjectId == project.Id)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new PortalIssueDto(i.Title, i.Description, i.Status, i.DueDate, i.Resolution))
            .ToListAsync(cancellationToken);

        var inspections = await db.Inspections
            .Where(i => i.ProjectId == project.Id)
            .OrderByDescending(i => i.InspectionDate)
            .Select(i => new PortalInspectionDto(i.InspectionDate, i.Status, i.SignedBy, i.SignedAt, i.Notes))
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var changeOrders = await db.ChangeOrders
            .Where(c => c.ProjectId == project.Id)
            .Include(c => c.Items)
            .Include(c => c.Signoffs)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var changeOrderDtos = changeOrders
            .Select(c => new PortalChangeOrderDto(
                c.OrderNo,
                c.Reason,
                c.Status.ToString(),
                c.TotalAmount,
                c.SignToken != null && c.SignTokenExpiresAt > now && !c.Signoffs.Any(),
                c.SignToken != null && c.SignTokenExpiresAt > now && !c.Signoffs.Any() ? c.SignToken : null,
                c.Items.Select(i => new PortalChangeOrderItemDto(i.ItemName, i.Description, i.Amount)).ToList()))
            .ToList();

        var invoices = await db.InvoicesReceivable
            .Where(i => i.ProjectId == project.Id)
            .OrderBy(i => i.DueDate)
            .Select(i => new PortalInvoiceDto(i.InvoiceNo, i.Amount, i.PaidAmount, i.InvoiceDate, i.DueDate, i.Status.ToString()))
            .ToListAsync(cancellationToken);

        var overallProgress = tasks.Count > 0 ? (int)Math.Round(tasks.Average(t => t.ProgressPct)) : 0;

        var dto = new PortalDataDto(
            new PortalProjectDto(project.Code, project.Name, project.Status.ToString(), project.OwnerName, project.Address, project.StartDate, project.EndDate, overallProgress),
            tasks,
            siteReports,
            issues,
            inspections,
            changeOrderDtos,
            invoices);

        return (PortalAccessResult.Success, dto);
    }
}
