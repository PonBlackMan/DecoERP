using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.DesignProposals;

public class ProposalSignoff : BaseEntity
{
    public Guid ProposalId { get; set; }
    public string SignedBy { get; set; } = string.Empty;
    public DateTime SignedAt { get; set; }
    public string? Notes { get; set; }

    public DesignProposal Proposal { get; set; } = null!;
}
