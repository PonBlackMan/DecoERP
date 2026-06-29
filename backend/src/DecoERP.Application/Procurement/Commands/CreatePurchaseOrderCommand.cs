using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Procurement;
using DecoERP.Domain.Enums;
using MediatR;

namespace DecoERP.Application.Procurement.Commands;

public record CreatePoItemDto(string Description, decimal UnitPrice, decimal Qty);

public record CreatePurchaseOrderCommand(
    Guid VendorId,
    string PoNumber,
    DateOnly? ExpectedDate,
    string? Notes,
    List<CreatePoItemDto> Items) : IRequest<Guid>;

public class CreatePurchaseOrderCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreatePurchaseOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var poItems = request.Items.Select(i => new PoItem
        {
            TenantId = currentUser.TenantId,
            MaterialId = Guid.Empty,
            QtyOrdered = i.Qty,
            QtyReceived = 0,
            UnitPrice = i.UnitPrice,
            Subtotal = i.UnitPrice * i.Qty
        }).ToList();

        var entity = new PurchaseOrder
        {
            TenantId = currentUser.TenantId,
            VendorId = request.VendorId,
            PoNumber = request.PoNumber,
            ExpectedDate = request.ExpectedDate,
            Notes = request.Notes,
            Status = PurchaseOrderStatus.Draft,
            TotalAmount = poItems.Sum(i => i.Subtotal),
            Items = poItems
        };

        db.PurchaseOrders.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
