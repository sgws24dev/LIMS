namespace ResearchLms.Billing.Application.DTOs;

public class Instrument365Dto
{
    public List<InstrumentDailyMetricDto> DailyMetrics { get; set; } = new();
    public Instrument365SummaryDto Summary { get; set; } = new();
}

public class InstrumentDailyMetricDto
{
    public DateTime Date { get; set; }
    public int TotalBookings { get; set; }
    public decimal UtilizedHours { get; set; }
    public decimal IdleHours { get; set; }
    public decimal DowntimeHours { get; set; }
    public decimal RevenueGenerated { get; set; }
    public int ServiceEventCount { get; set; }
    public decimal MaintenanceHours { get; set; }
}

public class Instrument365SummaryDto
{
    public decimal TotalRevenue { get; set; }
    public double UtilizationPercent { get; set; }
    public double DowntimePercent { get; set; }
    public double AvgBookingsPerDay { get; set; }
    public string TopServiceMonth { get; set; } = string.Empty;
}
