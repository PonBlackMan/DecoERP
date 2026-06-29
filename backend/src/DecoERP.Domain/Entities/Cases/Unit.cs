using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Cases;

public class Unit : BaseEntity
{
    public Guid DeveloperProjectId { get; set; }
    public string UnitNo { get; set; } = string.Empty;
    public string? Floor { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerPhone { get; set; }
    public string? OwnerEmail { get; set; }

    public DeveloperProject DeveloperProject { get; set; } = null!;
    public ICollection<Case> Cases { get; set; } = [];
}
