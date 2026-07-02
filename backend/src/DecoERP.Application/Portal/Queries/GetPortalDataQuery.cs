using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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

public class GetPortalDataQueryHandler(IDecoDbContext db, IServiceScopeFactory scopeFactory)
    : IRequestHandler<GetPortalDataQuery, (PortalAccessResult Result, PortalDataDto? Data)>
{
    // Each sub-query below runs against its own short-lived DbContext (via a fresh DI scope) so they
    // can execute concurrently — a single DbContext instance cannot run overlapping operations.
    private async Task<T> RunAsync<T>(Func<IDecoDbContext, Task<T>> query, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var scopedDb = scope.ServiceProvider.GetRequiredService<IDecoDbContext>();
        return await query(scopedDb);
    }

    public async Task<(PortalAccessResult Result, PortalDataDto? Data)> Handle(GetPortalDataQuery request, CancellationToken cancellationToken)
    {
        var (result, project) = await PortalAccessGuard.ValidateAsync(db, request.Token, request.PhoneLastFour, cancellationToken);
        if (result != PortalAccessResult.Success || project is null) return (result, null);

        var projectId = project.Id;

        var tasksTask = RunAsync(d => d.ProjectTasks.AsNoTracking()
            .Where(t => t.ProjectId == projectId)
            .OrderBy(t => t.PlannedStart)
            .Select(t => new PortalTaskDto(t.Name, t.PlannedStart, t.PlannedEnd, t.ActualEnd, t.ProgressPct))
            .ToListAsync(cancellationToken), cancellationToken);

        var siteReportsTask = RunAsync(d => d.SiteReports.AsNoTracking()
            .Where(s => s.ProjectId == projectId)
            .OrderByDescending(s => s.ReportDate)
            .Take(30)
            .Select(s => new PortalSiteReportDto(s.ReportDate, s.Weather, s.WorkersCount, s.Notes))
            .ToListAsync(cancellationToken), cancellationToken);

        var issuesTask = RunAsync(d => d.Issues.AsNoTracking()
            .Where(i => i.ProjectId == projectId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new PortalIssueDto(i.Title, i.Description, i.Status, i.DueDate, i.Resolution))
            .ToListAsync(cancellationToken), cancellationToken);

        var inspectionsTask = RunAsync(d => d.Inspections.AsNoTracking()
            .Where(i => i.ProjectId == projectId)
            .OrderByDescending(i => i.InspectionDate)
            .Select(i => new PortalInspectionDto(i.InspectionDate, i.Status, i.SignedBy, i.SignedAt, i.Notes))
            .ToListAsync(cancellationToken), cancellationToken);

        var changeOrdersTask = RunAsync(async d =>
        {
            var now = DateTime.UtcNow;
            var changeOrders = await d.ChangeOrders.AsNoTracking()
                .Where(c => c.ProjectId == projectId)
                .Include(c => c.Items)
                .Include(c => c.Signoffs)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(cancellationToken);

            return changeOrders
                .Select(c => new PortalChangeOrderDto(
                    c.OrderNo,
                    c.Reason,
                    c.Status.ToString(),
                    c.TotalAmount,
                    c.SignToken != null && c.SignTokenExpiresAt > now && !c.Signoffs.Any(),
                    c.SignToken != null && c.SignTokenExpiresAt > now && !c.Signoffs.Any() ? c.SignToken : null,
                    c.Items.Select(i => new PortalChangeOrderItemDto(i.ItemName, i.Description, i.Amount)).ToList()))
                .ToList();
        }, cancellationToken);

        var invoicesTask = RunAsync(d => d.InvoicesReceivable.AsNoTracking()
            .Where(i => i.ProjectId == projectId)
            .OrderBy(i => i.DueDate)
            .Select(i => new PortalInvoiceDto(i.InvoiceNo, i.Amount, i.PaidAmount, i.InvoiceDate, i.DueDate, i.Status.ToString()))
            .ToListAsync(cancellationToken), cancellationToken);

        await Task.WhenAll(tasksTask, siteReportsTask, issuesTask, inspectionsTask, changeOrdersTask, invoicesTask);

        var tasks = await tasksTask;
        var overallProgress = tasks.Count > 0 ? (int)Math.Round(tasks.Average(t => t.ProgressPct)) : 0;

        var dto = new PortalDataDto(
            new PortalProjectDto(project.Code, project.Name, project.Status.ToString(), project.OwnerName, project.Address, project.StartDate, project.EndDate, overallProgress),
            tasks,
            await siteReportsTask,
            await issuesTask,
            await inspectionsTask,
            await changeOrdersTask,
            await invoicesTask);

        return (PortalAccessResult.Success, dto);
    }
}
