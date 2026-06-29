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

    public Cases.Case Case { get; set; } = null!;
    public ICollection<QuoteItem> Items { get; set; } = [];
}
