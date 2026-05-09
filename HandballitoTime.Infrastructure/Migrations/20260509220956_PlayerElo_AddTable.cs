using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HandballitoTime.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PlayerElo_AddTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlayerElos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentElo = table.Column<int>(type: "integer", nullable: false),
                    HighestElo = table.Column<int>(type: "integer", nullable: false),
                    LowestElo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerElos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerElos_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerElos_PlayerId",
                table: "PlayerElos",
                column: "PlayerId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayerElos");
        }
    }
}
