using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResearchLms.Training.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Competencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ValidityPeriodDays = table.Column<int>(type: "int", nullable: false),
                    RequiresRenewal = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PrerequisiteRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstrumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrerequisiteRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrerequisiteRules_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCompetencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AchievedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RenewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompetencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCompetencies_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Competencies_TenantId",
                table: "Competencies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Competencies_TenantId_Category",
                table: "Competencies",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_PrerequisiteRules_CompetencyId",
                table: "PrerequisiteRules",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_PrerequisiteRules_TenantId_InstrumentId",
                table: "PrerequisiteRules",
                columns: new[] { "TenantId", "InstrumentId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetencies_CompetencyId",
                table: "UserCompetencies",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetencies_TenantId_CompetencyId",
                table: "UserCompetencies",
                columns: new[] { "TenantId", "CompetencyId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetencies_TenantId_Status",
                table: "UserCompetencies",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetencies_TenantId_UserId",
                table: "UserCompetencies",
                columns: new[] { "TenantId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrerequisiteRules");

            migrationBuilder.DropTable(
                name: "UserCompetencies");

            migrationBuilder.DropTable(
                name: "Competencies");
        }
    }
}
