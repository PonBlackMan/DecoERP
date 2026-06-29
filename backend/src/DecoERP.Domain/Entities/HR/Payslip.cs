using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.HR;

public class Payslip : BaseEntity
{
    public Guid PayrollId { get; set; }
    public string PdfUrl { get; set; } = string.Empty;
    public DateTime? SentAt { get; set; }

    public Payroll Payroll { get; set; } = null!;
}
