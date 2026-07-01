using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DecoERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuoteSignature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SignToken",
                table: "quotes",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SignTokenExpiresAt",
                table: "quotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignClientPhoneLastFour",
                table: "quotes",
                type: "character varying(4)",
                maxLength: 4,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClientSignatureData",
                table: "quotes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SignedAt",
                table: "quotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignerIpAddress",
                table: "quotes",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_quotes_SignToken",
                table: "quotes",
                column: "SignToken",
                unique: true,
                filter: "\"SignToken\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_quotes_SignToken",
                table: "quotes");

            migrationBuilder.DropColumn(name: "SignToken", table: "quotes");
            migrationBuilder.DropColumn(name: "SignTokenExpiresAt", table: "quotes");
            migrationBuilder.DropColumn(name: "SignClientPhoneLastFour", table: "quotes");
            migrationBuilder.DropColumn(name: "ClientSignatureData", table: "quotes");
            migrationBuilder.DropColumn(name: "SignedAt", table: "quotes");
            migrationBuilder.DropColumn(name: "SignerIpAddress", table: "quotes");
        }
    }
}
