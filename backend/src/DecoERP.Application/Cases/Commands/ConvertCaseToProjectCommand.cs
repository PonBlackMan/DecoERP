using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Projects;
using DecoERP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Cases.Commands;

public record ConvertCaseToProjectCommand(Guid CaseId, string ProjectCode, DateTime? StartDate, DateTime? EndDate) : IRequest<Guid?>;

public class ConvertCaseToProjectCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<ConvertCaseToProjectCommand, Guid?>
{
    public async Task<Guid?> Handle(ConvertCaseToProjectCommand request, CancellationToken cancellationToken)
    {
        var @case = await db.Cases
            .Include(c => c.Quotes)
            .FirstOrDefaultAsync(c => c.Id == request.CaseId && c.TenantId == currentUser.TenantId, cancellationToken);

        if (@case is null || @case.Stage != CaseStage.Contracted) return null;

        var contractAmount = @case.Quotes
            .Where(q => q.Status == QuoteStatus.Confirmed)
            .OrderByDescending(q => q.Version)
            .FirstOrDefault()?.TotalAmount ?? 0;

        var project = new Project
        {
            TenantId = currentUser.TenantId,
            CaseId = @case.Id,
            Code = request.ProjectCode,
            Name = @case.ClientName,
            OwnerName = @case.ClientName,
            OwnerPhone = @case.ClientPhone,
            ContractAmount = contractAmount,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = ProjectStatus.Contracted
        };

        db.Projects.Add(project);
        @case.ConvertedProjectId = project.Id;
        await db.SaveChangesAsync(cancellationToken);
        return project.Id;
    }
}
