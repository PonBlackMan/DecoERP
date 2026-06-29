using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Procurement;

public class PurchaseRequestItem : BaseEntity
{
    public Guid PurchaseRequestId { get; set; }
    public Guid MaterialId { get; set; }
    public decimal Qty { get; set; }
    public DateOnly? NeedDate { get; set; }
    public string? Notes { get; set; }

    public PurchaseRequest PurchaseRequest { get; set; } = null!;
}
