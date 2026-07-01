using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Entities.Projects;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Application.Portal;

public static class PortalAccessGuard
{
    public const int MaxFailedAttempts = 5;
    public static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    public static async Task<(PortalAccessResult Result, Project? Project)> ValidateAsync(
        IDecoDbContext db, string token, string phoneLastFour, CancellationToken cancellationToken)
    {
        var project = await db.Projects
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.PortalToken == token, cancellationToken);

        if (project is null) return (PortalAccessResult.NotFound, null);

        if (project.PortalTokenExpiresAt is null || project.PortalTokenExpiresAt < DateTime.UtcNow)
            return (PortalAccessResult.Expired, null);

        if (project.PortalLockedUntil.HasValue && project.PortalLockedUntil > DateTime.UtcNow)
            return (PortalAccessResult.Locked, null);

        if (project.PortalPhoneLastFour != phoneLastFour)
        {
            project.PortalFailedAttempts++;
            if (project.PortalFailedAttempts >= MaxFailedAttempts)
                project.PortalLockedUntil = DateTime.UtcNow.Add(LockoutDuration);

            await db.SaveChangesAsync(cancellationToken);
            return (PortalAccessResult.PhoneMismatch, null);
        }

        if (project.PortalFailedAttempts > 0)
        {
            project.PortalFailedAttempts = 0;
            project.PortalLockedUntil = null;
            await db.SaveChangesAsync(cancellationToken);
        }

        return (PortalAccessResult.Success, project);
    }
}
