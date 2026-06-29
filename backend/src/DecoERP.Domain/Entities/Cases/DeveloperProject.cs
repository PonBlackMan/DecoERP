using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Cases;

public class DeveloperProject : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string DeveloperName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Notes { get; set; }

    public ICollection<Unit> Units { get; set; } = [];
}
