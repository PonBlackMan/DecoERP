using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.ChangeOrders;

public class ChangeOrderItem : BaseEntity
{
    public Guid ChangeOrderId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Qty { get; set; }
    public decimal Amount { get; set; } // 可為負數（減項）

    public ChangeOrder ChangeOrder { get; set; } = null!;
}
