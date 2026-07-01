using DecoERP.Domain.Entities.AuditLogs;
using DecoERP.Domain.Entities.Cases;
using DecoERP.Domain.Entities.ChangeOrders;
using DecoERP.Domain.Entities.DesignProposals;
using DecoERP.Domain.Entities.Finance;
using DecoERP.Domain.Entities.HR;
using DecoERP.Domain.Entities.Procurement;
using DecoERP.Domain.Entities.Projects;
using DecoERP.Domain.Entities.Quotes;
using DecoERP.Domain.Entities.Tenants;
using DecoERP.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;

namespace DecoERP.Infrastructure.Persistence;

public class DecoDbContext(DbContextOptions<DecoDbContext> options) : DbContext(options), Application.Common.Interfaces.IDecoDbContext
{
    // Platform
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Cases
    public DbSet<DeveloperProject> DeveloperProjects => Set<DeveloperProject>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<CaseActivity> CaseActivities => Set<CaseActivity>();

    // Design Proposals
    public DbSet<DesignProposal> DesignProposals => Set<DesignProposal>();
    public DbSet<ProposalSignoff> ProposalSignoffs => Set<ProposalSignoff>();

    // Quotes
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<QuoteItem> QuoteItems => Set<QuoteItem>();
    public DbSet<QuoteTemplate> QuoteTemplates => Set<QuoteTemplate>();
    public DbSet<QuotePackage> QuotePackages => Set<QuotePackage>();
    public DbSet<QuotePackageItem> QuotePackageItems => Set<QuotePackageItem>();

    // Projects
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    public DbSet<SiteReport> SiteReports => Set<SiteReport>();
    public DbSet<Issue> Issues => Set<Issue>();
    public DbSet<InvoiceReceivable> InvoicesReceivable => Set<InvoiceReceivable>();
    public DbSet<Inspection> Inspections => Set<Inspection>();

    // Change Orders
    public DbSet<ChangeOrder> ChangeOrders => Set<ChangeOrder>();
    public DbSet<ChangeOrderItem> ChangeOrderItems => Set<ChangeOrderItem>();
    public DbSet<ChangeOrderSignoff> ChangeOrderSignoffs => Set<ChangeOrderSignoff>();

    // Procurement
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<PurchaseRequest> PurchaseRequests => Set<PurchaseRequest>();
    public DbSet<PurchaseRequestItem> PurchaseRequestItems => Set<PurchaseRequestItem>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PoItem> PoItems => Set<PoItem>();
    public DbSet<Inventory> Inventories => Set<Inventory>();

    // Finance
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<VoucherLine> VoucherLines => Set<VoucherLine>();
    public DbSet<ApRecord> ApRecords => Set<ApRecord>();
    public DbSet<ArRecord> ArRecords => Set<ArRecord>();

    // HR
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Payroll> Payrolls => Set<Payroll>();
    public DbSet<Payslip> Payslips => Set<Payslip>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DecoDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
