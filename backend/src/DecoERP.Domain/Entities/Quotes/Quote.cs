using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Quotes;

public class Quote : BaseEntity
{
    public Guid CaseId { get; set; }
    public string QuoteNo { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public QuoteStatus Status { get; set; } = QuoteStatus.Draft;
    public decimal TotalAmount { get; set; }
    public DateTime? ValidUntil { get; set; }
    public string? Notes { get; set; }

    public string? SignToken { get; set; }
    public DateTime? SignTokenExpiresAt { get; set; }
    public string? SignClientPhoneLastFour { get; set; }
    public string? ClientSignatureData { get; set; }
    public DateTime? SignedAt { get; set; }
    public string? SignerIpAddress { get; set; }

    public Cases.Case Case { get; set; } = null!;
    public ICollection<QuoteItem> Items { get; set; } = [];
}
