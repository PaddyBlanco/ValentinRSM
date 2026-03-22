using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ValentinRSM.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class IndexesAndDevSeedSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimelineEntries_ContactId",
                table: "TimelineEntries");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_CompanyId",
                table: "Contacts");

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEntries_ContactId_OccurredAt",
                table: "TimelineEntries",
                columns: new[] { "ContactId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_CompanyId_CreatedAt",
                table: "Contacts",
                columns: new[] { "CompanyId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_Email",
                table: "Contacts",
                column: "Email",
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_Status",
                table: "Companies",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimelineEntries_ContactId_OccurredAt",
                table: "TimelineEntries");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_CompanyId_CreatedAt",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_Email",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Companies_Status",
                table: "Companies");

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEntries_ContactId",
                table: "TimelineEntries",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_CompanyId",
                table: "Contacts",
                column: "CompanyId");
        }
    }
}
