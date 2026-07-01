using DecoERP.Domain.Entities.Cases;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class CaseConfiguration : IEntityTypeConfiguration<Case>
{
    public void Configure(EntityTypeBuilder<Case> builder)
    {
        builder.ToTable("cases");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.Property(x => x.Source).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Stage).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.ClientName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ClientPhone).HasMaxLength(30);
        builder.Property(x => x.ClientEmail).HasMaxLength(200);
        builder.Property(x => x.ReferrerName).HasMaxLength(100);
        builder.Property(x => x.ReferralFeePercent).HasPrecision(5, 2);
        builder.HasOne(x => x.Unit).WithMany(x => x.Cases).HasForeignKey(x => x.UnitId).IsRequired(false);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
