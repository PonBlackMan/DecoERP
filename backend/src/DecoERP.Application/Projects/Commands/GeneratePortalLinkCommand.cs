using DecoERP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Projects.Commands;

public record GeneratePortalLinkCommand(Guid ProjectId, string PhoneLastFour, int ExpiresInDays = 180) : IRequest<PortalLinkDto?>;

public record PortalLinkDto(string Token, DateTime ExpiresAt);

public class GeneratePortalLinkCommandHandler(IDecoDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GeneratePortalLinkCommand, PortalLinkDto?>
{
    public async Task<PortalLinkDto?> Handle(GeneratePortalLinkCommand request, CancellationToken cancellationToken)
    {
        var project = await db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && p.TenantId == currentUser.TenantId, cancellationToken);

        if (project is null) return null;

        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(request.ExpiresInDays);

        project.PortalToken = token;
        project.PortalTokenExpiresAt = expiresAt;
        project.PortalPhoneLastFour = request.PhoneLastFour;
        project.PortalFailedAttempts = 0;
        project.PortalLockedUntil = null;

        await db.SaveChangesAsync(cancellationToken);
        return new PortalLinkDto(token, expiresAt);
    }
}
