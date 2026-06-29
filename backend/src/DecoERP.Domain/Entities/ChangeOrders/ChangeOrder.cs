using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.ChangeOrders;

public class ChangeOrder : BaseEntity
{
    public Guid ProjectId { get; set; }
    public string OrderNo { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public ChangeOrderStatus Status { get; set; } = ChangeOrderStatus.Draft;
    public decimal TotalAmount { get; set; }

    public Projects.Project Project { get; set; } = null!;
    public ICollection<ChangeOrderItem> Items { get; set; } = [];
    public ICollection<ChangeOrderSignoff> Signoffs { get; set; } = [];
}
