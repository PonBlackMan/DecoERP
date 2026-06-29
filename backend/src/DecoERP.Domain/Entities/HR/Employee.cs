using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.HR;

public class Employee : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string? IdNumber { get; set; }
    public DateOnly HireDate { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal BaseSalary { get; set; }
    public Guid? LinkedUserId { get; set; }

    public ICollection<Attendance> Attendances { get; set; } = [];
    public ICollection<Payroll> Payrolls { get; set; } = [];
}
