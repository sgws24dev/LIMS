namespace ResearchLms.IntegrationTests.ComplianceTests;

public class ComplianceReportTests : IClassFixture<ComplianceWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ComplianceReportTests(ComplianceWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAuditLogsWithPagination_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs?page=1&pageSize=10");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetAuditLogsWithFilters_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs?entityType=Invoice&operation=Create");
        response.EnsureSuccessStatusCode();
    }
}
