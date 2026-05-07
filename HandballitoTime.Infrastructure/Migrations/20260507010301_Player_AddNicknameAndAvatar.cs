using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HandballitoTime.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Player_AddNicknameAndAvatar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Players",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nickname",
                table: "Players",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "Nickname",
                table: "Players");
        }
    }
}
