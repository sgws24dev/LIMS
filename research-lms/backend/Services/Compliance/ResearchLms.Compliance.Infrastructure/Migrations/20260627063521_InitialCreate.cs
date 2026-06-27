using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResearchLms.Compliance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Operation = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PreviousValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedByUserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ChangedByUserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ChangeReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PreviousHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CurrentHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Signatures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SignedEntityType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SignedEntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SignerUserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SignerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SignerEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SignatureData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Signatures", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId_ChangedByUserId",
                table: "AuditLogs",
                columns: new[] { "TenantId", "ChangedByUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId_EntityType_EntityId_Timestamp",
                table: "AuditLogs",
                columns: new[] { "TenantId", "EntityType", "EntityId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_Signatures_TenantId_SignedEntityType_SignedEntityId",
                table: "Signatures",
                columns: new[] { "TenantId", "SignedEntityType", "SignedEntityId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "Signatures");
        }
    }
}
