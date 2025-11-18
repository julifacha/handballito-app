using HandballitoTime.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HandballitoTime.Infrastructure
{
    public class HandballitoDbContext : DbContext
    {
        public DbSet<Player> Players => Set<Player>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<Match> Matches => Set<Match>();
        public DbSet<Location> Locations => Set<Location>();
        
        public HandballitoDbContext(DbContextOptions<HandballitoDbContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Team>()
                .HasMany(t => t.Players)
                .WithMany(p => p.Teams);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.WhiteTeam)
                .WithMany()
                .HasForeignKey(m => m.WhiteTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.BlackTeam)
                .WithMany()
                .HasForeignKey(m => m.BlackTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.WinnerTeam)
                .WithMany()
                .HasForeignKey(m => m.WinnerTeamId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.Location)
                .WithMany(l => l.Matches)
                .HasForeignKey(m => m.LocationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class HandballitoDbContextFactory : IDesignTimeDbContextFactory<HandballitoDbContext>
    {
        public HandballitoDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<HandballitoDbContext>();
            // Use your connection string here (adjust as needed)
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=handballito;Username=juli;Password=mypassword");

            return new HandballitoDbContext(optionsBuilder.Options);
        }
    }
}