using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Finance;

public class ArRecord : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? ChangeOrderId { get; set; }
    public decimal Amount { get; set; }
    public decimal ReceivedAmount { get; set; } = 0;
    public string Status { get; set; } = "unpaid"; // unpaid / partial / paid
    public string? Notes { get; set; }
}
