using DecoERP.Domain.Common;
using DecoERP.Domain.Enums;

namespace DecoERP.Domain.Entities.Finance;

public class Account : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
}
