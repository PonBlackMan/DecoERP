using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Cases;

public class Case : BaseEntity
{
    public Guid? UnitId { get; set; }
    public CaseSource Source { get; set; }
    public CaseStage Stage { get; set; } = CaseStage.Negotiating;
    public Guid? SalesRepId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public string? Requirements { get; set; }
    public Guid? ConvertedProjectId { get; set; }

    public Unit? Unit { get; set; }
    public ICollection<CaseActivity> Activities { get; set; } = [];
    public ICollection<DesignProposals.DesignProposal> DesignProposals { get; set; } = [];
    public ICollection<Quotes.Quote> Quotes { get; set; } = [];
}
