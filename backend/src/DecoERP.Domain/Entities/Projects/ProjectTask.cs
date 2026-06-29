using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Projects;

public class ProjectTask : BaseEntity
{
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime? PlannedStart { get; set; }
    public DateTime? PlannedEnd { get; set; }
    public DateTime? ActualEnd { get; set; }
    public int ProgressPct { get; set; } = 0;
    public Guid? AssigneeId { get; set; }

    public Project Project { get; set; } = null!;
}
