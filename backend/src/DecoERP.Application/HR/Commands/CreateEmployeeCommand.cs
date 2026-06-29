using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.HR;
using MediatR;

namespace DecoERP.Application.HR.Commands;

public record CreateEmployeeCommand(
    string FullName,
    string? IdNumber,
    DateOnly HireDate,
    string JobTitle,
    string Department,
    string? Phone,
    string? Email,
    decimal BaseSalary,
    string? EmergencyContact,
    string? EmergencyPhone) : IRequest<Guid>;

public class CreateEmployeeCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateEmployeeCommand, Guid>
{
    public async Task<Guid> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var entity = new Employee
        {
            TenantId = currentUser.TenantId,
            FullName = request.FullName,
            IdNumber = request.IdNumber,
            HireDate = request.HireDate,
            JobTitle = request.JobTitle,
            Department = request.Department,
            Phone = request.Phone,
            Email = request.Email,
            BaseSalary = request.BaseSalary,
            EmergencyContact = request.EmergencyContact,
            EmergencyPhone = request.EmergencyPhone,
            IsActive = true
        };

        db.Employees.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
