using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace HandballitoTime.Infrastructure
{
    public class HandballitoDbContextFactory : IDesignTimeDbContextFactory<HandballitoDbContext>
    {
        public HandballitoDbContext CreateDbContext(string[] args)
        {
            // Build configuration
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            // Get connection string from configuration or environment
            var connectionString = config.GetConnectionString("DefaultConnection")
                ?? config["DATABASE_URL"] // For Railway or other env-based setups
                ?? "Host=localhost;Port=5432;Database=handballito;Username=juli;Password=mypassword"; // fallback

            var optionsBuilder = new DbContextOptionsBuilder<HandballitoDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new HandballitoDbContext(optionsBuilder.Options);
        }
    }
}
