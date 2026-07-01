using System;
using DecoERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DecoERP.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(DecoDbContext))]
    [Migration("20260701000000_AddChangeOrderSignature")]
    public partial class AddChangeOrderSignature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SignToken",
                table: "change_orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SignTokenExpiresAt",
                table: "change_orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignClientPhoneLastFour",
                table: "change_orders",
                type: "character varying(4)",
                maxLength: 4,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_change_orders_SignToken",
                table: "change_orders",
                column: "SignToken",
                unique: true,
                filter: "\"SignToken\" IS NOT NULL");

            migrationBuilder.AddColumn<string>(
                name: "SignatureData",
                table: "ChangeOrderSignoffs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClientPhoneLastFour",
                table: "ChangeOrderSignoffs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "ChangeOrderSignoffs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_change_orders_SignToken",
                table: "change_orders");

            migrationBuilder.DropColumn(
                name: "SignToken",
                table: "change_orders");

            migrationBuilder.DropColumn(
                name: "SignTokenExpiresAt",
                table: "change_orders");

            migrationBuilder.DropColumn(
                name: "SignClientPhoneLastFour",
                table: "change_orders");

            migrationBuilder.DropColumn(
                name: "SignatureData",
                table: "ChangeOrderSignoffs");

            migrationBuilder.DropColumn(
                name: "ClientPhoneLastFour",
                table: "ChangeOrderSignoffs");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "ChangeOrderSignoffs");
        }
    }
}
