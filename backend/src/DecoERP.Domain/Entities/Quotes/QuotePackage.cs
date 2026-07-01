using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Quotes;

public class QuotePackage : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<QuotePackageItem> Items { get; set; } = [];
}
