using DecoERP.Application.Common.Interfaces;
using DecoERP.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DecoERP.Infrastructure.BackgroundServices;

public class OverdueInvoiceCheckService(IServiceScopeFactory scopeFactory, ILogger<OverdueInvoiceCheckService> logger)
    : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(24);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckOverdueInvoicesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "檢查逾期應收帳款時發生錯誤");
            }

            try
            {
                await Task.Delay(CheckInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
            }
        }
    }

    private async Task CheckOverdueInvoicesAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IDecoDbContext>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var overdueInvoices = await db.InvoicesReceivable
            .Where(i => i.DueDate != null
                        && i.DueDate < today
                        && (i.Status == InvoiceStatus.Pending || i.Status == InvoiceStatus.PartiallyPaid))
            .ToListAsync(cancellationToken);

        if (overdueInvoices.Count == 0) return;

        foreach (var invoice in overdueInvoices)
            invoice.Status = InvoiceStatus.Overdue;

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("已將 {Count} 筆應收帳款標記為逾期", overdueInvoices.Count);
    }
}
