using DecoERP.Domain.Entities.Quotes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DecoERP.Infrastructure.Persistence.Configurations;

public class QuoteConfiguration : IEntityTypeConfiguration<Quote>
{
    public void Configure(EntityTypeBuilder<Quote> builder)
    {
        builder.ToTable("quotes");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.TenantId);
        builder.Property(x => x.QuoteNo).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.Property(x => x.SignToken).HasMaxLength(64);
        builder.HasIndex(x => x.SignToken).IsUnique().HasFilter("sign_token IS NOT NULL");
        builder.Property(x => x.SignClientPhoneLastFour).HasMaxLength(4);
        builder.HasOne(x => x.Case).WithMany(x => x.Quotes).HasForeignKey(x => x.CaseId);
        builder.HasMany(x => x.Items).WithOne(x => x.Quote).HasForeignKey(x => x.QuoteId);
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
