using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Projects;

public class SiteReport : BaseEntity
{
    public Guid ProjectId { get; set; }
    public DateOnly ReportDate { get; set; }
    public string? Weather { get; set; }
    public int WorkersCount { get; set; }
    public string Notes { get; set; } = string.Empty;
    public Guid ReportedBy { get; set; }

    public Project Project { get; set; } = null!;
}
