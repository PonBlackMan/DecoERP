using DecoERP.Domain.Entities.ChangeOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class ChangeOrderConfiguration : IEntityTypeConfiguration<ChangeOrder>
{
    public void Configure(EntityTypeBuilder<ChangeOrder> builder)
    {
        builder.ToTable("change_orders");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.Property(x => x.OrderNo).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.Property(x => x.SignToken).HasMaxLength(64);
        builder.HasIndex(x => x.SignToken).IsUnique().HasFilter("sign_token IS NOT NULL");
        builder.Property(x => x.SignClientPhoneLastFour).HasMaxLength(4);
        builder.HasOne(x => x.Project).WithMany(x => x.ChangeOrders).HasForeignKey(x => x.ProjectId);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
