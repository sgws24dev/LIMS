-- V6.1: Create Analytics Views for Phase 6 Dashboards
-- Deploy after the Analytics EF Core migration has created the new tables.

-- vw_DashboardRevenue: Daily revenue totals by category with moving averages
CREATE OR ALTER VIEW vw_DashboardRevenue
AS
SELECT
    i.TenantId,
    CAST(i.InvoiceDate AS DATE) AS [Date],
    i.BilledToEntityType AS Category,
    SUM(i.TotalAmount) AS DailyRevenue,
    AVG(SUM(i.TotalAmount)) OVER (
        PARTITION BY i.TenantId, i.BilledToEntityType
        ORDER BY CAST(i.InvoiceDate AS DATE)
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS MovingAvg7d,
    AVG(SUM(i.TotalAmount)) OVER (
        PARTITION BY i.TenantId, i.BilledToEntityType
        ORDER BY CAST(i.InvoiceDate AS DATE)
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) AS MovingAvg30d
FROM Invoices i
WHERE i.IsDeleted = 0
GROUP BY i.TenantId, CAST(i.InvoiceDate AS DATE), i.BilledToEntityType;
GO

-- vw_DashboardUtilization: Instrument utilization rates by day
CREATE OR ALTER VIEW vw_DashboardUtilization
AS
SELECT
    i.TenantId,
    CAST(i.InvoiceDate AS DATE) AS [Date],
    i.BilledToEntityId AS InstrumentId,
    COUNT(*) AS BookedHours,
    24 AS AvailableHours,
    CAST(COUNT(*) AS DECIMAL(10, 2)) / 24.0 * 100 AS UtilizationRate
FROM Invoices i
WHERE i.IsDeleted = 0 AND i.BilledToEntityType = 'Booking'
GROUP BY i.TenantId, CAST(i.InvoiceDate AS DATE), i.BilledToEntityId;
GO

-- vw_DashboardAging: Receivables aging summaries
CREATE OR ALTER VIEW vw_DashboardAging
AS
SELECT
    TenantId,
    CASE
        WHEN DATEDIFF(DAY, DueDate, GETUTCDATE()) <= 30 THEN '0-30'
        WHEN DATEDIFF(DAY, DueDate, GETUTCDATE()) <= 60 THEN '31-60'
        WHEN DATEDIFF(DAY, DueDate, GETUTCDATE()) <= 90 THEN '61-90'
        ELSE '90+'
    END AS AgingBucket,
    COUNT(*) AS [Count],
    SUM(BalanceDue) AS TotalAmount,
    AVG(DATEDIFF(DAY, DueDate, GETUTCDATE())) AS WeightedAvgDays
FROM Invoices
WHERE IsDeleted = 0 AND Status IN ('Overdue', 'Sent', 'Pending')
GROUP BY TenantId,
    CASE
        WHEN DATEDIFF(DAY, DueDate, GETUTCDATE()) <= 30 THEN '0-30'
        WHEN DATEDIFF(DAY, DueDate, GETUTCDATE()) <= 60 THEN '31-60'
        WHEN DATEDIFF(DAY, DueDate, GETUTCDATE()) <= 90 THEN '61-90'
        ELSE '90+'
    END;
GO

-- vw_InstrumentDailyMetrics: Aggregated daily metrics per instrument
CREATE OR ALTER VIEW vw_InstrumentDailyMetrics
AS
SELECT
    i.TenantId,
    i.BilledToEntityId AS InstrumentId,
    CAST(i.InvoiceDate AS DATE) AS [Date],
    COUNT(*) AS TotalBookings,
    COALESCE(SUM(il.Quantity), 0) AS UtilizedHours,
    24 - COALESCE(SUM(il.Quantity), 0) AS IdleHours,
    0 AS DowntimeHours,
    COALESCE(SUM(i.TotalAmount), 0) AS RevenueGenerated,
    COUNT(*) AS ServiceEventCount,
    0 AS MaintenanceHours
FROM Invoices i
LEFT JOIN InvoiceLineItems il ON il.InvoiceId = i.Id AND il.IsDeleted = 0
WHERE i.IsDeleted = 0 AND i.BilledToEntityType = 'Booking'
GROUP BY i.TenantId, i.BilledToEntityId, CAST(i.InvoiceDate AS DATE);
GO
