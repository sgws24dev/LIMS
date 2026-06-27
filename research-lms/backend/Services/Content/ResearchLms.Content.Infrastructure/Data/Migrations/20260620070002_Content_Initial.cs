using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResearchLms.Content.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Content_Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HelpArticles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    ViewCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
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
                    table.PrimaryKey("PK_HelpArticles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HelpCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ParentCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_HelpCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomepageDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Layout = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_HomepageDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PublicationInstrumentLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PublicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstrumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    table.PrimaryKey("PK_PublicationInstrumentLinks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Publications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Authors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Journal = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Doi = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PmId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PublicationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Link = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Abstract = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Attachments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_Publications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserWalkthroughProgress",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WalkthroughId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CurrentStepIndex = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_UserWalkthroughProgress", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Walkthroughs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    TargetRoute = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Trigger = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
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
                    table.PrimaryKey("PK_Walkthroughs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WalkthroughSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WalkthroughId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ElementSelector = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Placement = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
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
                    table.PrimaryKey("PK_WalkthroughSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WalkthroughSteps_Walkthroughs_WalkthroughId",
                        column: x => x.WalkthroughId,
                        principalTable: "Walkthroughs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HelpArticles_Slug",
                table: "HelpArticles",
                column: "Slug");

            migrationBuilder.CreateIndex(
                name: "IX_HelpArticles_TenantId_CategoryId",
                table: "HelpArticles",
                columns: new[] { "TenantId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_HelpArticles_TenantId_IsPublished",
                table: "HelpArticles",
                columns: new[] { "TenantId", "IsPublished" });

            migrationBuilder.CreateIndex(
                name: "IX_HelpCategories_Slug",
                table: "HelpCategories",
                column: "Slug");

            migrationBuilder.CreateIndex(
                name: "IX_HelpCategories_TenantId_ParentCategoryId",
                table: "HelpCategories",
                columns: new[] { "TenantId", "ParentCategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_HomepageDefinitions_TenantId_IsActive",
                table: "HomepageDefinitions",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_PublicationInstrumentLinks_PublicationId_InstrumentId",
                table: "PublicationInstrumentLinks",
                columns: new[] { "PublicationId", "InstrumentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicationInstrumentLinks_TenantId_InstrumentId",
                table: "PublicationInstrumentLinks",
                columns: new[] { "TenantId", "InstrumentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Publications_Doi",
                table: "Publications",
                column: "Doi",
                unique: true,
                filter: "[Doi] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Publications_TenantId_PublicationDate",
                table: "Publications",
                columns: new[] { "TenantId", "PublicationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Publications_TenantId_Type",
                table: "Publications",
                columns: new[] { "TenantId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_UserWalkthroughProgress_TenantId_UserId_WalkthroughId",
                table: "UserWalkthroughProgress",
                columns: new[] { "TenantId", "UserId", "WalkthroughId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Walkthroughs_TenantId_TargetRoute_IsActive",
                table: "Walkthroughs",
                columns: new[] { "TenantId", "TargetRoute", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_WalkthroughSteps_TenantId_WalkthroughId",
                table: "WalkthroughSteps",
                columns: new[] { "TenantId", "WalkthroughId" });

            migrationBuilder.CreateIndex(
                name: "IX_WalkthroughSteps_WalkthroughId",
                table: "WalkthroughSteps",
                column: "WalkthroughId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HelpArticles");

            migrationBuilder.DropTable(
                name: "HelpCategories");

            migrationBuilder.DropTable(
                name: "HomepageDefinitions");

            migrationBuilder.DropTable(
                name: "PublicationInstrumentLinks");

            migrationBuilder.DropTable(
                name: "Publications");

            migrationBuilder.DropTable(
                name: "UserWalkthroughProgress");

            migrationBuilder.DropTable(
                name: "WalkthroughSteps");

            migrationBuilder.DropTable(
                name: "Walkthroughs");
        }
    }
}
