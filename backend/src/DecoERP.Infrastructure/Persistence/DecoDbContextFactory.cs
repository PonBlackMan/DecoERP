using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DecoERP.Infrastructure.Persistence;

public class DecoDbContextFactory : IDesignTimeDbContextFactory<DecoDbContext>
{
    public DecoDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<DecoDbContext>()
            .UseNpgsql("Host=localhost;Database=decoerp_design;Username=postgres;Password=postgres")
            .Options;
        return new DecoDbContext(options);
    }
}
