using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Projects;

public class Project : BaseEntity
{
    public Guid? CaseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerPhone { get; set; }
    public decimal ContractAmount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Contracted;
    public Guid? SiteManagerId { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }

    public string? PortalToken { get; set; }
    public DateTime? PortalTokenExpiresAt { get; set; }
    public string? PortalPhoneLastFour { get; set; }
    public int PortalFailedAttempts { get; set; } = 0;
    public DateTime? PortalLockedUntil { get; set; }

    public ICollection<ProjectTask> Tasks { get; set; } = [];
    public ICollection<SiteReport> SiteReports { get; set; } = [];
    public ICollection<Issue> Issues { get; set; } = [];
    public ICollection<InvoiceReceivable> Invoices { get; set; } = [];
    public ICollection<Inspection> Inspections { get; set; } = [];
    public ICollection<ChangeOrders.ChangeOrder> ChangeOrders { get; set; } = [];
}
