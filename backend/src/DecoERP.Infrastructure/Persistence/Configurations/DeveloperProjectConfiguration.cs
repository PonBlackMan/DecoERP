using DecoERP.Domain.Entities.Cases;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class DeveloperProjectConfiguration : IEntityTypeConfiguration<DeveloperProject>
{
    public void Configure(EntityTypeBuilder<DeveloperProject> builder)
    {
        builder.ToTable("developer_projects");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DeveloperName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(300);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.ContactName).HasMaxLength(100);
        builder.Property(x => x.ContactPhone).HasMaxLength(30);
        builder.Property(x => x.ContactEmail).HasMaxLength(200);
        builder.Property(x => x.CommissionRatePercent).HasPrecision(5, 2);
        builder.Property(x => x.DeliveryRequirements).HasMaxLength(1000);
        builder.Property(x => x.BrandStandards).HasMaxLength(1000);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
