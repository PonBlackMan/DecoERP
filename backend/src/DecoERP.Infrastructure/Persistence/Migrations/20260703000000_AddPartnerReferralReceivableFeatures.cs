using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DecoERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPartnerReferralReceivableFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoicesReceivable_projects_ProjectId",
                table: "InvoicesReceivable");

            migrationBuilder.DropForeignKey(
                name: "FK_Units_DeveloperProjects_DeveloperProjectId",
                table: "Units");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InvoicesReceivable",
                table: "InvoicesReceivable");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeveloperProjects",
                table: "DeveloperProjects");

            migrationBuilder.RenameTable(
                name: "InvoicesReceivable",
                newName: "invoices_receivable");

            migrationBuilder.RenameTable(
                name: "DeveloperProjects",
                newName: "developer_projects");

            migrationBuilder.RenameIndex(
                name: "IX_InvoicesReceivable_ProjectId",
                table: "invoices_receivable",
                newName: "IX_invoices_receivable_ProjectId");

            migrationBuilder.AddColumn<bool>(
                name: "ReferralFeePaid",
                table: "cases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReferralFeePaidAt",
                table: "cases",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "invoices_receivable",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "PaidAmount",
                table: "invoices_receivable",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "invoices_receivable",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNo",
                table: "invoices_receivable",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "invoices_receivable",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "developer_projects",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "developer_projects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "DeveloperName",
                table: "developer_projects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "developer_projects",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BrandStandards",
                table: "developer_projects",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CommissionRatePercent",
                table: "developer_projects",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "developer_projects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "developer_projects",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "developer_projects",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryRequirements",
                table: "developer_projects",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "developer_projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_invoices_receivable",
                table: "invoices_receivable",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_developer_projects",
                table: "developer_projects",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_receivable_Status_DueDate",
                table: "invoices_receivable",
                columns: new[] { "Status", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_invoices_receivable_TenantId",
                table: "invoices_receivable",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_developer_projects_TenantId",
                table: "developer_projects",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_invoices_receivable_projects_ProjectId",
                table: "invoices_receivable",
                column: "ProjectId",
                principalTable: "projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Units_developer_projects_DeveloperProjectId",
                table: "Units",
                column: "DeveloperProjectId",
                principalTable: "developer_projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_invoices_receivable_projects_ProjectId",
                table: "invoices_receivable");

            migrationBuilder.DropForeignKey(
                name: "FK_Units_developer_projects_DeveloperProjectId",
                table: "Units");

            migrationBuilder.DropPrimaryKey(
                name: "PK_invoices_receivable",
                table: "invoices_receivable");

            migrationBuilder.DropIndex(
                name: "IX_invoices_receivable_Status_DueDate",
                table: "invoices_receivable");

            migrationBuilder.DropIndex(
                name: "IX_invoices_receivable_TenantId",
                table: "invoices_receivable");

            migrationBuilder.DropPrimaryKey(
                name: "PK_developer_projects",
                table: "developer_projects");

            migrationBuilder.DropIndex(
                name: "IX_developer_projects_TenantId",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "ReferralFeePaid",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "ReferralFeePaidAt",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "BrandStandards",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "CommissionRatePercent",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "DeliveryRequirements",
                table: "developer_projects");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "developer_projects");

            migrationBuilder.RenameTable(
                name: "invoices_receivable",
                newName: "InvoicesReceivable");

            migrationBuilder.RenameTable(
                name: "developer_projects",
                newName: "DeveloperProjects");

            migrationBuilder.RenameIndex(
                name: "IX_invoices_receivable_ProjectId",
                table: "InvoicesReceivable",
                newName: "IX_InvoicesReceivable_ProjectId");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "InvoicesReceivable",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<decimal>(
                name: "PaidAmount",
                table: "InvoicesReceivable",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "InvoicesReceivable",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNo",
                table: "InvoicesReceivable",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "InvoicesReceivable",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "DeveloperProjects",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "DeveloperProjects",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "DeveloperName",
                table: "DeveloperProjects",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "DeveloperProjects",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(300)",
                oldMaxLength: 300,
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_InvoicesReceivable",
                table: "InvoicesReceivable",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeveloperProjects",
                table: "DeveloperProjects",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoicesReceivable_projects_ProjectId",
                table: "InvoicesReceivable",
                column: "ProjectId",
                principalTable: "projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Units_DeveloperProjects_DeveloperProjectId",
                table: "Units",
                column: "DeveloperProjectId",
                principalTable: "DeveloperProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
