using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.Cases;

public class CaseActivity : BaseEntity
{
    public Guid CaseId { get; set; }
    public string Type { get; set; } = string.Empty; // call / visit / meeting / note
    public string Content { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;

    public Case Case { get; set; } = null!;
}
