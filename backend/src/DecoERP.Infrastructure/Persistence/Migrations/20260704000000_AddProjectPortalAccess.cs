using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DecoERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectPortalAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PortalFailedAttempts",
                table: "projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "PortalLockedUntil",
                table: "projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PortalPhoneLastFour",
                table: "projects",
                type: "character varying(4)",
                maxLength: 4,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PortalToken",
                table: "projects",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PortalTokenExpiresAt",
                table: "projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_PortalToken",
                table: "projects",
                column: "PortalToken",
                unique: true,
                filter: "\"PortalToken\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_projects_PortalToken",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PortalFailedAttempts",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PortalLockedUntil",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PortalPhoneLastFour",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PortalToken",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PortalTokenExpiresAt",
                table: "projects");
        }
    }
}
