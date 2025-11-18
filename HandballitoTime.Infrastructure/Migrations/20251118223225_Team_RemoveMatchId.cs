using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HandballitoTime.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Team_RemoveMatchId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teams_Matches_MatchId",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Teams_MatchId",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "MatchId",
                table: "Teams");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MatchId",
                table: "Teams",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Teams_MatchId",
                table: "Teams",
                column: "MatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_Matches_MatchId",
                table: "Teams",
                column: "MatchId",
                principalTable: "Matches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
