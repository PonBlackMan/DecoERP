using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.DesignProposals;

public class DesignProposal : BaseEntity
{
    public Guid CaseId { get; set; }
    public int Version { get; set; } = 1;
    public string FileUrl { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "draft"; // draft / pending_review / approved

    public Cases.Case Case { get; set; } = null!;
    public ICollection<ProposalSignoff> Signoffs { get; set; } = [];
}
