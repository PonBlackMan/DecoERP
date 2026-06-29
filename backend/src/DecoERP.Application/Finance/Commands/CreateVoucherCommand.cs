using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Finance;
using DecoERP.Domain.Enums;
using MediatR;

namespace DecoERP.Application.Finance.Commands;

public record CreateVoucherLineDto(Guid AccountId, decimal DebitAmount, decimal CreditAmount, string? Description);

public record CreateVoucherCommand(
    string VoucherNo,
    DateOnly VoucherDate,
    string Description,
    List<CreateVoucherLineDto> Lines) : IRequest<Guid>;

public class CreateVoucherCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateVoucherCommand, Guid>
{
    public async Task<Guid> Handle(CreateVoucherCommand request, CancellationToken cancellationToken)
    {
        var lines = request.Lines.Select((l, index) => new VoucherLine
        {
            TenantId = currentUser.TenantId,
            AccountId = l.AccountId,
            DebitAmount = l.DebitAmount,
            CreditAmount = l.CreditAmount,
            Description = l.Description,
            SortOrder = index
        }).ToList();

        var entity = new Voucher
        {
            TenantId = currentUser.TenantId,
            VoucherNo = request.VoucherNo,
            VoucherDate = request.VoucherDate,
            Description = request.Description,
            Status = VoucherStatus.Draft,
            Lines = lines
        };

        db.Vouchers.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
