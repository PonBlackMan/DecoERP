using DecoERP.Domain.Entities.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class InvoiceReceivableConfiguration : IEntityTypeConfiguration<InvoiceReceivable>
{
    public void Configure(EntityTypeBuilder<InvoiceReceivable> builder)
    {
        builder.ToTable("invoices_receivable");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.Status, x.DueDate });
        builder.Property(x => x.InvoiceNo).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(18, 2);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Notes).HasMaxLength(500);
        builder.HasOne(x => x.Project).WithMany(x => x.Invoices).HasForeignKey(x => x.ProjectId);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
