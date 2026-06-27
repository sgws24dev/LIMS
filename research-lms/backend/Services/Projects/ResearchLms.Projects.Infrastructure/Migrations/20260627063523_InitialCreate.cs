using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResearchLms.Projects.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CostCenters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BudgetAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SpentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ManagerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ManagerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    FiscalYear = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_CostCenters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Spent = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProjectManagerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProjectManagerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CostCenterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssignedToId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedToName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EstimatedHours = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ActualHours = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BilledAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_WorkOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkOrders_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Issues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssignedToId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedToName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ReportedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportedByName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WorkOrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ExternalId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ExternalUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExternalProvider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_Issues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Issues_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Issues_WorkOrders_WorkOrderId",
                        column: x => x.WorkOrderId,
                        principalTable: "WorkOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_Code",
                table: "CostCenters",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_IsActive_FiscalYear",
                table: "CostCenters",
                columns: new[] { "TenantId", "IsActive", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_AssignedToId",
                table: "Issues",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_Issues_ProjectId",
                table: "Issues",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Issues_TenantId_ExternalId_ExternalProvider",
                table: "Issues",
                columns: new[] { "TenantId", "ExternalId", "ExternalProvider" });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_TenantId_Status_Severity",
                table: "Issues",
                columns: new[] { "TenantId", "Status", "Severity" });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_WorkOrderId",
                table: "Issues",
                column: "WorkOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProjectManagerId",
                table: "Projects",
                column: "ProjectManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_TenantId_Status_IsArchived",
                table: "Projects",
                columns: new[] { "TenantId", "Status", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_AssignedToId",
                table: "WorkOrders",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_ProjectId_Status",
                table: "WorkOrders",
                columns: new[] { "ProjectId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_TenantId_Status",
                table: "WorkOrders",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CostCenters");

            migrationBuilder.DropTable(
                name: "Issues");

            migrationBuilder.DropTable(
                name: "WorkOrders");

            migrationBuilder.DropTable(
                name: "Projects");
        }
    }
}
