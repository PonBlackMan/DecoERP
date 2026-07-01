using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Quotes;

public class QuotePackageItem : BaseEntity
{
    public Guid QuotePackageId { get; set; }
    public string SpaceName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal Qty { get; set; } = 1;
    public int SortOrder { get; set; }
    public QuotePackage Package { get; set; } = null!;
}
