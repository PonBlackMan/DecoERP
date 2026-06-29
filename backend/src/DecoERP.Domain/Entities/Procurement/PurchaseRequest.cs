using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Procurement;

public class PurchaseRequest : BaseEntity
{
    public Guid? ProjectId { get; set; }
    public string Status { get; set; } = "pending"; // pending / approved / rejected
    public Guid RequestedBy { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<PurchaseRequestItem> Items { get; set; } = [];
}
