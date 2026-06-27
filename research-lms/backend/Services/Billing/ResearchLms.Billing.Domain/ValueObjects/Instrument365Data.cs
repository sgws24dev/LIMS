namespace ResearchLms.Billing.Domain.ValueObjects;

public class Instrument365Data
{
    public IReadOnlyList<InstrumentDailyMetric> DailyMetrics { get; }
    public Instrument365Summary Summary { get; }

    public Instrument365Data(List<InstrumentDailyMetric> dailyMetrics, Instrument365Summary summary)
    {
        DailyMetrics = dailyMetrics;
        Summary = summary;
    }
}

public class InstrumentDailyMetric
{
    public DateTime Date { get; }
    public int TotalBookings { get; }
    public decimal UtilizedHours { get; }
    public decimal IdleHours { get; }
    public decimal DowntimeHours { get; }
    public decimal RevenueGenerated { get; }
    public int ServiceEventCount { get; }
    public decimal MaintenanceHours { get; }

    public InstrumentDailyMetric(
        DateTime date,
        int totalBookings,
        decimal utilizedHours,
        decimal idleHours,
        decimal downtimeHours,
        decimal revenueGenerated,
        int serviceEventCount,
        decimal maintenanceHours)
    {
        Date = date;
        TotalBookings = totalBookings;
        UtilizedHours = utilizedHours;
        IdleHours = idleHours;
        DowntimeHours = downtimeHours;
        RevenueGenerated = revenueGenerated;
        ServiceEventCount = serviceEventCount;
        MaintenanceHours = maintenanceHours;
    }
}

public class Instrument365Summary
{
    public decimal TotalRevenue { get; }
    public double UtilizationPercent { get; }
    public double DowntimePercent { get; }
    public double AvgBookingsPerDay { get; }
    public string TopServiceMonth { get; }

    public Instrument365Summary(
        decimal totalRevenue,
        double utilizationPercent,
        double downtimePercent,
        double avgBookingsPerDay,
        string topServiceMonth)
    {
        TotalRevenue = totalRevenue;
        UtilizationPercent = utilizationPercent;
        DowntimePercent = downtimePercent;
        AvgBookingsPerDay = avgBookingsPerDay;
        TopServiceMonth = topServiceMonth;
    }
}
