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

namespace DecoERP.Application.Common.Interfaces;

public interface IDecoDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<DeveloperProject> DeveloperProjects { get; }
    DbSet<Unit> Units { get; }
    DbSet<Case> Cases { get; }
    DbSet<CaseActivity> CaseActivities { get; }
    DbSet<DesignProposal> DesignProposals { get; }
    DbSet<ProposalSignoff> ProposalSignoffs { get; }
    DbSet<Quote> Quotes { get; }
    DbSet<QuoteItem> QuoteItems { get; }
    DbSet<QuoteTemplate> QuoteTemplates { get; }
    DbSet<QuotePackage> QuotePackages { get; }
    DbSet<QuotePackageItem> QuotePackageItems { get; }
    DbSet<Project> Projects { get; }
    DbSet<ProjectTask> ProjectTasks { get; }
    DbSet<SiteReport> SiteReports { get; }
    DbSet<Issue> Issues { get; }
    DbSet<InvoiceReceivable> InvoicesReceivable { get; }
    DbSet<Inspection> Inspections { get; }
    DbSet<ChangeOrder> ChangeOrders { get; }
    DbSet<ChangeOrderItem> ChangeOrderItems { get; }
    DbSet<ChangeOrderSignoff> ChangeOrderSignoffs { get; }
    DbSet<Vendor> Vendors { get; }
    DbSet<Material> Materials { get; }
    DbSet<PurchaseRequest> PurchaseRequests { get; }
    DbSet<PurchaseOrder> PurchaseOrders { get; }
    DbSet<PoItem> PoItems { get; }
    DbSet<Inventory> Inventories { get; }
    DbSet<Account> Accounts { get; }
    DbSet<Voucher> Vouchers { get; }
    DbSet<VoucherLine> VoucherLines { get; }
    DbSet<ApRecord> ApRecords { get; }
    DbSet<ArRecord> ArRecords { get; }
    DbSet<Employee> Employees { get; }
    DbSet<Attendance> Attendances { get; }
    DbSet<Payroll> Payrolls { get; }
    DbSet<Payslip> Payslips { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
