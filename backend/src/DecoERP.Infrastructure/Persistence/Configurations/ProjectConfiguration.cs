using DecoERP.Domain.Entities.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.ContractAmount).HasPrecision(18, 2);
        builder.Property(x => x.PortalToken).HasMaxLength(64);
        builder.HasIndex(x => x.PortalToken).IsUnique().HasFilter("\"PortalToken\" IS NOT NULL");
        builder.Property(x => x.PortalPhoneLastFour).HasMaxLength(4);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
