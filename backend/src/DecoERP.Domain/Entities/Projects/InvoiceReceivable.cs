using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Projects;

public class InvoiceReceivable : BaseEntity
{
    public Guid ProjectId { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public DateOnly InvoiceDate { get; set; }
    public DateOnly? DueDate { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    public string? Notes { get; set; }

    public Project Project { get; set; } = null!;
}
