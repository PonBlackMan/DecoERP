using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Projects.Commands;

public record RecordInvoiceReceivablePaymentCommand(Guid InvoiceId, decimal Amount) : IRequest<bool>;

public class RecordInvoiceReceivablePaymentCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<RecordInvoiceReceivablePaymentCommand, bool>
{
    public async Task<bool> Handle(RecordInvoiceReceivablePaymentCommand request, CancellationToken cancellationToken)
    {
        var invoice = await db.InvoicesReceivable
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.TenantId == currentUser.TenantId, cancellationToken);

        if (invoice is null) return false;

        invoice.PaidAmount += request.Amount;
        invoice.Status = invoice.PaidAmount >= invoice.Amount
            ? InvoiceStatus.Paid
            : invoice.PaidAmount > 0
                ? InvoiceStatus.PartiallyPaid
                : InvoiceStatus.Pending;

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
