using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Cases;

public class DeveloperProject : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string DeveloperName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public string? ContactName { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public decimal? CommissionRatePercent { get; set; }
    public string? DeliveryRequirements { get; set; }
    public string? BrandStandards { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Unit> Units { get; set; } = [];
}
