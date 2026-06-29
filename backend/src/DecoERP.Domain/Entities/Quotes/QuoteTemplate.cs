using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Quotes;

public class QuoteTemplate : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal ReferencePrice { get; set; }
    public string? Remark { get; set; }
}
