using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.ChangeOrders;
using DecoERP.Domain.Enums;
using MediatR;

namespace DecoERP.Application.ChangeOrders.Commands;

public record CreateChangeOrderItemDto(string ItemName, string? Description, decimal UnitPrice, decimal Qty);

public record CreateChangeOrderCommand(
    Guid ProjectId,
    string OrderNo,
    string Reason,
    List<CreateChangeOrderItemDto> Items) : IRequest<Guid>;

public class CreateChangeOrderCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateChangeOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreateChangeOrderCommand request, CancellationToken cancellationToken)
    {
        var items = request.Items.Select(i => new ChangeOrderItem
        {
            TenantId = currentUser.TenantId,
            ItemName = i.ItemName,
            Description = i.Description,
            UnitPrice = i.UnitPrice,
            Qty = i.Qty,
            Amount = i.UnitPrice * i.Qty
        }).ToList();

        var entity = new ChangeOrder
        {
            TenantId = currentUser.TenantId,
            ProjectId = request.ProjectId,
            OrderNo = request.OrderNo,
            Reason = request.Reason,
            Status = ChangeOrderStatus.Draft,
            TotalAmount = items.Sum(i => i.Amount),
            Items = items
        };

        db.ChangeOrders.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
