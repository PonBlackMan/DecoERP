using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Queries;

public record ReferralFeeDto(
    Guid CaseId,
    string ClientName,
    string ReferrerName,
    decimal ReferralFeePercent,
    decimal? ContractAmount,
    decimal? FeeAmount,
    bool ReferralFeePaid,
    DateTime? ReferralFeePaidAt,
    DateTime CreatedAt);

public record GetReferralFeesQuery(bool UnpaidOnly = false) : IRequest<IList<ReferralFeeDto>>;

public class GetReferralFeesQueryHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetReferralFeesQuery, IList<ReferralFeeDto>>
{
    public async Task<IList<ReferralFeeDto>> Handle(GetReferralFeesQuery request, CancellationToken cancellationToken)
    {
        var query =
            from c in db.Cases
            where c.TenantId == currentUser.TenantId
                  && c.ReferrerName != null
                  && c.ReferralFeePercent != null
            join p in db.Projects on c.ConvertedProjectId equals (Guid?)p.Id into projGroup
            from p in projGroup.DefaultIfEmpty()
            select new
            {
                c.Id,
                c.ClientName,
                c.ReferrerName,
                c.ReferralFeePercent,
                ContractAmount = (decimal?)p.ContractAmount,
                c.ReferralFeePaid,
                c.ReferralFeePaidAt,
                c.CreatedAt,
            };

        var raw = await query.OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);

        var items = raw
            .Select(x => new ReferralFeeDto(
                x.Id,
                x.ClientName,
                x.ReferrerName!,
                x.ReferralFeePercent!.Value,
                x.ContractAmount,
                x.ContractAmount.HasValue ? Math.Round(x.ContractAmount.Value * x.ReferralFeePercent.Value / 100, 0) : null,
                x.ReferralFeePaid,
                x.ReferralFeePaidAt,
                x.CreatedAt))
            .Where(x => !request.UnpaidOnly || (!x.ReferralFeePaid && x.FeeAmount.HasValue))
            .ToList();

        return items;
    }
}
