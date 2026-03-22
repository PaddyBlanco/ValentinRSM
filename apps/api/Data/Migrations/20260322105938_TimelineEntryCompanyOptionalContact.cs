using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ValentinRSM.Api.Data.Migrations;

/// <inheritdoc />
public partial class TimelineEntryCompanyOptionalContact : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_TimelineEntries_Contacts_ContactId",
            table: "TimelineEntries");

        migrationBuilder.DropIndex(
            name: "IX_TimelineEntries_ContactId_OccurredAt",
            table: "TimelineEntries");

        migrationBuilder.AddColumn<Guid>(
            name: "CompanyId",
            table: "TimelineEntries",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.Sql(
            """
            UPDATE te
            SET te.CompanyId = c.CompanyId
            FROM TimelineEntries AS te
            INNER JOIN Contacts AS c ON c.Id = te.ContactId
            """);

        migrationBuilder.AlterColumn<Guid>(
            name: "CompanyId",
            table: "TimelineEntries",
            type: "uniqueidentifier",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier",
            oldNullable: true);

        migrationBuilder.AlterColumn<Guid>(
            name: "ContactId",
            table: "TimelineEntries",
            type: "uniqueidentifier",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier");

        migrationBuilder.CreateIndex(
            name: "IX_TimelineEntries_CompanyId_OccurredAt",
            table: "TimelineEntries",
            columns: new[] { "CompanyId", "OccurredAt" });

        migrationBuilder.CreateIndex(
            name: "IX_TimelineEntries_ContactId_OccurredAt",
            table: "TimelineEntries",
            columns: new[] { "ContactId", "OccurredAt" });

        migrationBuilder.AddForeignKey(
            name: "FK_TimelineEntries_Companies_CompanyId",
            table: "TimelineEntries",
            column: "CompanyId",
            principalTable: "Companies",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_TimelineEntries_Contacts_ContactId",
            table: "TimelineEntries",
            column: "ContactId",
            principalTable: "Contacts",
            principalColumn: "Id",
            onDelete: ReferentialAction.NoAction);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_TimelineEntries_Companies_CompanyId",
            table: "TimelineEntries");

        migrationBuilder.DropForeignKey(
            name: "FK_TimelineEntries_Contacts_ContactId",
            table: "TimelineEntries");

        migrationBuilder.DropIndex(
            name: "IX_TimelineEntries_CompanyId_OccurredAt",
            table: "TimelineEntries");

        migrationBuilder.DropIndex(
            name: "IX_TimelineEntries_ContactId_OccurredAt",
            table: "TimelineEntries");

        migrationBuilder.Sql(
            """
            DELETE FROM TimelineEntries WHERE ContactId IS NULL
            """);

        migrationBuilder.DropColumn(
            name: "CompanyId",
            table: "TimelineEntries");

        migrationBuilder.AlterColumn<Guid>(
            name: "ContactId",
            table: "TimelineEntries",
            type: "uniqueidentifier",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier",
            oldNullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_TimelineEntries_ContactId_OccurredAt",
            table: "TimelineEntries",
            columns: new[] { "ContactId", "OccurredAt" });

        migrationBuilder.AddForeignKey(
            name: "FK_TimelineEntries_Contacts_ContactId",
            table: "TimelineEntries",
            column: "ContactId",
            principalTable: "Contacts",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }
}
