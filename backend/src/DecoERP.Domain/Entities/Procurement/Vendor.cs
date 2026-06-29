using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Procurement;

public class Vendor : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? ContactName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? PaymentTerms { get; set; }
    public string Category { get; set; } = string.Empty; // 建材 / 家具 / 燈具 / 系統櫥
    public string? Address { get; set; }
    public string? Notes { get; set; }
}
