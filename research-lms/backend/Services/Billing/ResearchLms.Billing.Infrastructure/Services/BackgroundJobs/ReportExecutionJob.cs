using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Services.BackgroundJobs;

public class ReportExecutionJob
{
    private readonly BillingDbContext _context;
    private readonly IReportService _reportService;
    private readonly IReportExportService _exportService;
    private readonly IEmailService _emailService;

    public ReportExecutionJob(
        BillingDbContext context,
        IReportService reportService,
        IReportExportService exportService,
        IEmailService emailService)
    {
        _context = context;
        _reportService = reportService;
        _exportService = exportService;
        _emailService = emailService;
    }

    public async Task ExecuteAsync(Guid scheduleId, CancellationToken ct = default)
    {
        var schedule = await _context.ReportSchedules
            .FindAsync(new object[] { scheduleId }, ct);

        if (schedule == null || !schedule.IsActive)
            return;

        var report = await _context.ReportDefinitions
            .FindAsync(new object[] { schedule.ReportDefinitionId }, ct);

        if (report == null)
            return;

        var result = await _reportService.RunAsync(report, 1, 10000, ct);
        var export = await _exportService.ExportAsync(result, schedule.Format, ct);

        var recipients = System.Text.Json.JsonSerializer.Deserialize<List<string>>(schedule.Recipients) ?? new();
        if (recipients.Count == 0)
            return;

        var subject = schedule.Subject
            .Replace("{{ReportName}}", report.Name)
            .Replace("{{Date}}", DateTime.UtcNow.ToString("yyyy-MM-dd"));

        await _emailService.SendBulkAsync(
            recipients.ToArray(),
            subject,
            "Please find attached the scheduled report.",
            export.Content,
            export.FileName,
            export.ContentType,
            ct);

        schedule.MarkDelivered(DateTime.UtcNow);
        await _context.SaveChangesAsync(ct);
    }
}
