using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Quotes;

public class QuoteItem : BaseEntity
{
    public Guid QuoteId { get; set; }
    public string SpaceName { get; set; } = string.Empty;   // 客廳 / 主臥 / 廚房...
    public string Category { get; set; } = string.Empty;    // 木作 / 油漆 / 水電...
    public string ItemName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal Qty { get; set; }
    public decimal Subtotal { get; set; }
    public string? Remark { get; set; }
    public int SortOrder { get; set; }

    public Quote Quote { get; set; } = null!;
}
