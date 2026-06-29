using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Procurement;

public class PurchaseOrder : BaseEntity
{
    public Guid VendorId { get; set; }
    public Guid? PurchaseRequestId { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public decimal TotalAmount { get; set; }
    public DateOnly? ExpectedDate { get; set; }
    public string? Notes { get; set; }

    public Vendor Vendor { get; set; } = null!;
    public ICollection<PoItem> Items { get; set; } = [];
}
