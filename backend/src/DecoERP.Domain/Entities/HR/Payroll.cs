using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.HR;

public class Payroll : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public string Month { get; set; } = string.Empty; // YYYY-MM
    public decimal BaseSalary { get; set; }
    public decimal OvertimePay { get; set; } = 0;
    public decimal Bonus { get; set; } = 0;
    public decimal LaborInsurance { get; set; } = 0;
    public decimal HealthInsurance { get; set; } = 0;
    public decimal IncomeTax { get; set; } = 0;
    public decimal OtherDeductions { get; set; } = 0;
    public decimal NetPay { get; set; }
    public string Status { get; set; } = "draft"; // draft / confirmed / paid

    public Employee Employee { get; set; } = null!;
    public Payslip? Payslip { get; set; }
}
