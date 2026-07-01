using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Projects;
using MediatR;

namespace DecoERP.Application.Projects.Commands;

public record CreateInvoiceReceivableCommand(
    Guid ProjectId,
    string InvoiceNo,
    decimal Amount,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    string? Notes) : IRequest<Guid>;

public class CreateInvoiceReceivableCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateInvoiceReceivableCommand, Guid>
{
    public async Task<Guid> Handle(CreateInvoiceReceivableCommand request, CancellationToken cancellationToken)
    {
        var invoice = new InvoiceReceivable
        {
            TenantId = currentUser.TenantId,
            ProjectId = request.ProjectId,
            InvoiceNo = request.InvoiceNo,
            Amount = request.Amount,
            InvoiceDate = request.InvoiceDate,
            DueDate = request.DueDate,
            Notes = request.Notes,
        };

        db.InvoicesReceivable.Add(invoice);
        await db.SaveChangesAsync(cancellationToken);
        return invoice.Id;
    }
}
