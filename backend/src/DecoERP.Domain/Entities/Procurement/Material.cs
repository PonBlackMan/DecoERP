using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Procurement;

public class Material : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string? Spec { get; set; }
    public Guid? DefaultVendorId { get; set; }
    public string? Notes { get; set; }
}
