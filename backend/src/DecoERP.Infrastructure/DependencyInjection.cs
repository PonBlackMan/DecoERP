using DecoERP.Application.Common.Interfaces;
using DecoERP.Infrastructure.BackgroundServices;
using DecoERP.Infrastructure.Identity;
using DecoERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DecoERP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<DecoDbContext>(options =>
            options
                .UseNpgsql(config.GetConnectionString("DefaultConnection"))
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

        services.AddScoped<IDecoDbContext>(provider => provider.GetRequiredService<DecoDbContext>());
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddHttpContextAccessor();
        services.AddHostedService<OverdueInvoiceCheckService>();

        return services;
    }
}
