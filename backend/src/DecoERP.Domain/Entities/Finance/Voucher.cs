using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Finance;

public class Voucher : BaseEntity
{
    public string VoucherNo { get; set; } = string.Empty;
    public DateOnly VoucherDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public VoucherStatus Status { get; set; } = VoucherStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<VoucherLine> Lines { get; set; } = [];
}
