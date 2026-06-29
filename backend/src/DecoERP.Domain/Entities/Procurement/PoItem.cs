using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Procurement;

public class PoItem : BaseEntity
{
    public Guid PoId { get; set; }
    public Guid MaterialId { get; set; }
    public decimal QtyOrdered { get; set; }
    public decimal QtyReceived { get; set; } = 0;
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }

    public PurchaseOrder PurchaseOrder { get; set; } = null!;
}
