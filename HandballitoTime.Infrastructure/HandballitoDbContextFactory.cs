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
                ?? config["DATABASE_URL"]; // For Railway or other env-based setups;

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Could not find a connection string.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<HandballitoDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new HandballitoDbContext(optionsBuilder.Options);
        }
    }
}
