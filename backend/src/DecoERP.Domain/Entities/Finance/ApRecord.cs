using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Finance;

public class ApRecord : BaseEntity
{
    public Guid VendorId { get; set; }
    public Guid? PoId { get; set; }
    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = "unpaid"; // unpaid / partial / paid
    public string? Notes { get; set; }
}
