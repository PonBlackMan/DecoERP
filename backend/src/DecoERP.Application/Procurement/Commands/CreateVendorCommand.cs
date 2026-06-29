using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Procurement;
using MediatR;

namespace DecoERP.Application.Procurement.Commands;

public record CreateVendorCommand(
    string Name,
    string Category,
    string? TaxId,
    string? ContactName,
    string? Phone,
    string? Email,
    string? PaymentTerms,
    string? Address,
    string? Notes) : IRequest<Guid>;

public class CreateVendorCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateVendorCommand, Guid>
{
    public async Task<Guid> Handle(CreateVendorCommand request, CancellationToken cancellationToken)
    {
        var entity = new Vendor
        {
            TenantId = currentUser.TenantId,
            Name = request.Name,
            Category = request.Category,
            TaxId = request.TaxId,
            ContactName = request.ContactName,
            Phone = request.Phone,
            Email = request.Email,
            PaymentTerms = request.PaymentTerms,
            Address = request.Address,
            Notes = request.Notes
        };

        db.Vendors.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
