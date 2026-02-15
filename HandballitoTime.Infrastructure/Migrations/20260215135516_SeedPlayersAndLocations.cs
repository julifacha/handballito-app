using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HandballitoTime.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedPlayersAndLocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO "Players" ("Id", "Name") VALUES
                  (gen_random_uuid(), 'Chris'),
                  (gen_random_uuid(), 'Guchy'),
                  (gen_random_uuid(), 'Pende'),
                  (gen_random_uuid(), 'Depol'),
                  (gen_random_uuid(), 'Kuba'),
                  (gen_random_uuid(), 'Negro'),
                  (gen_random_uuid(), 'Nico'),
                  (gen_random_uuid(), 'Nina'),
                  (gen_random_uuid(), 'Juli'),
                  (gen_random_uuid(), 'Ailu'),
                  (gen_random_uuid(), 'Lau'),
                  (gen_random_uuid(), 'Vero'),
                  (gen_random_uuid(), 'Pipu'),
                  (gen_random_uuid(), 'Nene');

                INSERT INTO "Locations" ("Id", "Name", "Address") VALUES
                  (gen_random_uuid(), 'CUM', 'Gral. Belgrano 2676 B1605CGH, B1605CGH Munro, Provincia de Buenos Aires'),
                  (gen_random_uuid(), 'INDU', 'Mendoza 2563, C1428DKQ Munro, Provincia de Buenos Aires');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "Players" WHERE "Name" IN ('Chris','Guchy','Pende','Depol','Kuba','Negro','Nico','Nina','Juli','Ailu','Lau','Vero','Pipu','Nene');
                DELETE FROM "Locations" WHERE "Name" IN ('CUM','INDU');
                """);
        }
    }
}
