using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Finance;

public class VoucherLine : BaseEntity
{
    public Guid VoucherId { get; set; }
    public Guid AccountId { get; set; }
    public decimal DebitAmount { get; set; } = 0;
    public decimal CreditAmount { get; set; } = 0;
    public string? Description { get; set; }
    public int SortOrder { get; set; }

    public Voucher Voucher { get; set; } = null!;
}
