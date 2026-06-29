using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Procurement;

public class Inventory : BaseEntity
{
    public Guid MaterialId { get; set; }
    public decimal QtyOnHand { get; set; } = 0;
    public string Warehouse { get; set; } = "main";
}
