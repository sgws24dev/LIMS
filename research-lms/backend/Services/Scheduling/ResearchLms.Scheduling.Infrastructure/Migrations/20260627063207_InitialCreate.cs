using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResearchLms.Scheduling.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookingResources",
                columns: table => new
                {
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Identifier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FacilityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FacilityName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    HourlyRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingResources", x => x.ResourceId);
                });

            migrationBuilder.CreateTable(
                name: "CalendarConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AccessToken = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    TokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExternalCalendarId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    LastSyncAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SyncDirection = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
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
                    table.PrimaryKey("PK_CalendarConnections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CalendarEventMappings",
                columns: table => new
                {
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ExternalEventId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarEventMappings", x => new { x.BookingId, x.Provider });
                });

            migrationBuilder.CreateTable(
                name: "Constraints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_Constraints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConsumableStockCache",
                columns: table => new
                {
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CurrentStock = table.Column<int>(type: "int", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumableStockCache", x => x.ItemId);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceWindows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceWindows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecurringRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Frequency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DayOfWeekMask = table.Column<int>(type: "int", nullable: false),
                    TimeOfDay = table.Column<TimeOnly>(type: "time", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    MaxInstances = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastGeneratedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    GeneratedCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
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
                    table.PrimaryKey("PK_RecurringRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResourceOperatingHours",
                columns: table => new
                {
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MondayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    MondayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    TuesdayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    TuesdayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    WednesdayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    WednesdayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    ThursdayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    ThursdayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    FridayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    FridayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    SaturdayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    SaturdayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    SundayStart = table.Column<TimeOnly>(type: "time", nullable: true),
                    SundayEnd = table.Column<TimeOnly>(type: "time", nullable: true),
                    Timezone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "UTC"),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceOperatingHours", x => x.ResourceId);
                });

            migrationBuilder.CreateTable(
                name: "TrainerAvailability",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DayOfWeek = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Manual"),
                    ExternalEventId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_TrainerAvailability", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserCompetencyCache",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompetencyCache", x => new { x.UserId, x.CompetencyCode });
                });

            migrationBuilder.CreateTable(
                name: "WaitlistEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceType = table.Column<int>(type: "int", nullable: false),
                    RequestedDate = table.Column<DateOnly>(type: "date", nullable: false),
                    RequestedStartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    RequestedEndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PromotedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProvisionalBookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_WaitlistEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CalendarSyncLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CalendarConnectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Direction = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EventsCreated = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    EventsUpdated = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    EventsDeleted = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SyncedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    table.PrimaryKey("PK_CalendarSyncLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CalendarSyncLogs_CalendarConnections_CalendarConnectionId",
                        column: x => x.CalendarConnectionId,
                        principalTable: "CalendarConnections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CheckedInAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RecurringRuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_BookingResources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "BookingResources",
                        principalColumn: "ResourceId");
                    table.ForeignKey(
                        name: "FK_Bookings_RecurringRules_RecurringRuleId",
                        column: x => x.RecurringRuleId,
                        principalTable: "RecurringRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingResources_Name",
                table: "BookingResources",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_BookingResources_TenantId_ResourceType",
                table: "BookingResources",
                columns: new[] { "TenantId", "ResourceType" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_RecurringRuleId",
                table: "Bookings",
                column: "RecurringRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ResourceId_StartTime_EndTime",
                table: "Bookings",
                columns: new[] { "ResourceId", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_CalendarConnections_TenantId_UserId_Provider",
                table: "CalendarConnections",
                columns: new[] { "TenantId", "UserId", "Provider" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CalendarSyncLogs_CalendarConnectionId",
                table: "CalendarSyncLogs",
                column: "CalendarConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarSyncLogs_TenantId_UserId_SyncedAt",
                table: "CalendarSyncLogs",
                columns: new[] { "TenantId", "UserId", "SyncedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Constraints_TenantId_ResourceId_IsActive",
                table: "Constraints",
                columns: new[] { "TenantId", "ResourceId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsumableStockCache_Sku",
                table: "ConsumableStockCache",
                column: "Sku");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWindows_ResourceId_StartTime_EndTime",
                table: "MaintenanceWindows",
                columns: new[] { "ResourceId", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringRules_TenantId_ResourceId_Status",
                table: "RecurringRules",
                columns: new[] { "TenantId", "ResourceId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringRules_TenantId_UserId_Status",
                table: "RecurringRules",
                columns: new[] { "TenantId", "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainerAvailability_TenantId_IsAvailable_DayOfWeek",
                table: "TrainerAvailability",
                columns: new[] { "TenantId", "IsAvailable", "DayOfWeek" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainerAvailability_TenantId_UserId_DayOfWeek_IsAvailable",
                table: "TrainerAvailability",
                columns: new[] { "TenantId", "UserId", "DayOfWeek", "IsAvailable" });

            migrationBuilder.CreateIndex(
                name: "IX_WaitlistEntries_TenantId_ResourceId_RequestedDate_Status",
                table: "WaitlistEntries",
                columns: new[] { "TenantId", "ResourceId", "RequestedDate", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WaitlistEntries_TenantId_UserId_Status",
                table: "WaitlistEntries",
                columns: new[] { "TenantId", "UserId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "CalendarEventMappings");

            migrationBuilder.DropTable(
                name: "CalendarSyncLogs");

            migrationBuilder.DropTable(
                name: "Constraints");

            migrationBuilder.DropTable(
                name: "ConsumableStockCache");

            migrationBuilder.DropTable(
                name: "MaintenanceWindows");

            migrationBuilder.DropTable(
                name: "ResourceOperatingHours");

            migrationBuilder.DropTable(
                name: "TrainerAvailability");

            migrationBuilder.DropTable(
                name: "UserCompetencyCache");

            migrationBuilder.DropTable(
                name: "WaitlistEntries");

            migrationBuilder.DropTable(
                name: "BookingResources");

            migrationBuilder.DropTable(
                name: "RecurringRules");

            migrationBuilder.DropTable(
                name: "CalendarConnections");
        }
    }
}
