using DecoERP.Domain.Entities.Quotes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class QuotePackageConfiguration : IEntityTypeConfiguration<QuotePackage>
{
    public void Configure(EntityTypeBuilder<QuotePackage> builder)
    {
        builder.ToTable("quote_packages");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.HasMany(x => x.Items).WithOne(x => x.Package).HasForeignKey(x => x.QuotePackageId);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public class QuotePackageItemConfiguration : IEntityTypeConfiguration<QuotePackageItem>
{
    public void Configure(EntityTypeBuilder<QuotePackageItem> builder)
    {
        builder.ToTable("quote_package_items");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SpaceName).HasMaxLength(50);
        builder.Property(x => x.Category).HasMaxLength(50);
        builder.Property(x => x.ItemName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Unit).HasMaxLength(20);
        builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
        builder.Property(x => x.Qty).HasPrecision(18, 2);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
