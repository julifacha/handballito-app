using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HandballitoTime.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Match_AddIsDraw : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDraw",
                table: "Matches",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDraw",
                table: "Matches");
        }
    }
}
