using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Projects;

public class Inspection : BaseEntity
{
    public Guid ProjectId { get; set; }
    public DateOnly InspectionDate { get; set; }
    public string Status { get; set; } = "pending"; // pending / passed / failed
    public string? SignedBy { get; set; }
    public DateTime? SignedAt { get; set; }
    public string? Notes { get; set; }

    public Project Project { get; set; } = null!;
}
