using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Projects;

public class Issue : BaseEntity
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "open"; // open / in_progress / resolved / closed
    public Guid? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Resolution { get; set; }

    public Project Project { get; set; } = null!;
}
