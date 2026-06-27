using System.Net.Http.Json;
using FluentAssertions;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.IntegrationTests.BillingTests;

public class AnalyticsTests : IClassFixture<BillingWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly BillingWebApplicationFactory _factory;

    public AnalyticsTests(BillingWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDashboards_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/dashboards");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateDashboard_ThenGetById_ReturnsDashboard()
    {
        var create = await _client.PostAsJsonAsync("/api/v1/billing/dashboards", new
        {
            name = "Test Dashboard",
            description = "Integration test dashboard",
            layout = "{\"widgets\":[]}",
            isDefault = false,
            widgets = Array.Empty<object>()
        });
        create.EnsureSuccessStatusCode();

        var dashboard = await create.Content.ReadFromJsonAsync<DashboardDefinitionDto>();
        dashboard.Should().NotBeNull();
        dashboard!.Name.Should().Be("Test Dashboard");
    }

    [Fact]
    public async Task GetReportDefinitions_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/report-definitions");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateReportDefinition_ThenPreview_ThenRun_Works()
    {
        var create = await _client.PostAsJsonAsync("/api/v1/billing/report-definitions", new
        {
            name = "Test Report",
            sourceEntity = "Invoice",
            fieldsJson = "[\"InvoiceNumber\",\"TotalAmount\",\"Status\"]",
            filtersJson = "[]"
        });
        create.EnsureSuccessStatusCode();

        var report = await create.Content.ReadFromJsonAsync<ReportDefinitionDto>();
        report.Should().NotBeNull();
        report!.Name.Should().Be("Test Report");

        var preview = await _client.PostAsJsonAsync("/api/v1/billing/reports/preview", new
        {
            reportDefinitionId = report.Id
        });
        preview.EnsureSuccessStatusCode();

        var run = await _client.PostAsJsonAsync("/api/v1/billing/reports/run", new
        {
            reportDefinitionId = report.Id,
            page = 1,
            pageSize = 10
        });
        run.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateReportSchedule_ThenGet_ReturnsSchedule()
    {
        var createReport = await _client.PostAsJsonAsync("/api/v1/billing/report-definitions", new
        {
            name = "Scheduled Report",
            sourceEntity = "Invoice",
            fieldsJson = "[\"InvoiceNumber\"]",
            filtersJson = "[]"
        });
        createReport.EnsureSuccessStatusCode();
        var report = await createReport.Content.ReadFromJsonAsync<ReportDefinitionDto>();
        report.Should().NotBeNull();

        var createSchedule = await _client.PostAsJsonAsync("/api/v1/billing/report-schedules", new
        {
            reportDefinitionId = report!.Id,
            cronExpression = "0 8 * * 1",
            timeZoneId = "UTC",
            format = "Pdf",
            recipients = "[\"test@test.com\"]",
            subject = "{{ReportName}} - {{Date}}"
        });
        createSchedule.EnsureSuccessStatusCode();

        var schedule = await createSchedule.Content.ReadFromJsonAsync<ReportScheduleDto>();
        schedule.Should().NotBeNull();
        schedule!.ReportDefinitionId.Should().Be(report.Id);
        schedule.Format.Should().Be("Pdf");

        var schedules = await _client.GetFromJsonAsync<List<ReportScheduleDto>>("/api/v1/billing/report-schedules");
        schedules.Should().Contain(s => s.Id == schedule.Id);
    }

    [Fact]
    public async Task ExportReport_ReturnsFile()
    {
        var create = await _client.PostAsJsonAsync("/api/v1/billing/report-definitions", new
        {
            name = "Export Report",
            sourceEntity = "Invoice",
            fieldsJson = "[\"InvoiceNumber\",\"TotalAmount\"]",
            filtersJson = "[]"
        });
        create.EnsureSuccessStatusCode();
        var report = await create.Content.ReadFromJsonAsync<ReportDefinitionDto>();
        report.Should().NotBeNull();
        report!.Id.Should().NotBeEmpty();

        var csvExport = await _client.GetAsync($"/api/v1/billing/reports/{report.Id}/export?format=csv");
        csvExport.EnsureSuccessStatusCode();
        csvExport.Content.Headers.ContentType?.MediaType.Should().Be("text/csv");

        var pdfExport = await _client.GetAsync($"/api/v1/billing/reports/{report.Id}/export?format=pdf");
        pdfExport.EnsureSuccessStatusCode();
        pdfExport.Content.Headers.ContentType?.MediaType.Should().Be("application/pdf");
    }
}
