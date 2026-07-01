using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.ChangeOrders;

public class ChangeOrderSignoff : BaseEntity
{
    public Guid ChangeOrderId { get; set; }
    public string SignedBy { get; set; } = string.Empty;
    public DateTime SignedAt { get; set; }
    public string? Notes { get; set; }

    public string? SignatureData { get; set; }
    public string? ClientPhoneLastFour { get; set; }
    public string? IpAddress { get; set; }

    public ChangeOrder ChangeOrder { get; set; } = null!;
}
