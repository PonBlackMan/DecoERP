using DecoERP.Domain.Common;

namespace DecoERP.Domain.Entities.HR;

public class Attendance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public DateOnly WorkDate { get; set; }
    public TimeOnly? CheckIn { get; set; }
    public TimeOnly? CheckOut { get; set; }
    public Guid? ProjectId { get; set; }
    public string? Notes { get; set; }

    public Employee Employee { get; set; } = null!;
}
