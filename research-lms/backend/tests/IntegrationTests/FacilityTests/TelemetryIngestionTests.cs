using System.Net;
using System.Net.Http.Json;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests.FacilityTests;

public class TelemetryIngestionTests : IClassFixture<FacilityWebApplicationFactory>
{
    private readonly HttpClient _client;
    private Guid _facilityId;
    private Guid _instrumentId;

    public TelemetryIngestionTests(FacilityWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", "00000000-0000-0000-0000-000000000001");
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureInstrumentExists()
    {
        if (_facilityId == Guid.Empty)
        {
            var facDto = new CreateFacilityDto("Telemetry Test Lab", "Research", "Building F");
            var facResponse = await _client.PostAsJsonAsync("/api/v1/facilities", facDto);
            var facCreated = await facResponse.Content.ReadFromJsonAsync<FacilityDto>();
            _facilityId = facCreated!.Id;
        }

        if (_instrumentId == Guid.Empty)
        {
            var assetDto = new CreateAssetRequest(
                "Telemetry Instrument", "TEL-001", "Instruments", _facilityId,
                "T100", "TestCorp", DateOnly.FromDateTime(DateTime.UtcNow),
                3000, 300, 3, "StraightLine", "Telemetry Room", null, null, null,
                "10.0.0.1", 9090, "MQTT", "v2.0", null, null, null, true);
            var assetResponse = await _client.PostAsJsonAsync("/api/v1/assets", assetDto);
            var assetContent = await assetResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
            _instrumentId = Guid.Parse(assetContent!.Data!.ToString()!);
        }
    }

    [Fact]
    public async Task IngestTelemetry_ValidPayload_ReturnsCreated()
    {
        await EnsureInstrumentExists();
        var dto = new IngestTelemetryRequest(
            _instrumentId,
            DateTime.UtcNow,
            new Dictionary<string, double> { { "temperature", 37.2 }, { "humidity", 65.0 } },
            "HTTP");

        var response = await _client.PostAsJsonAsync("/api/v1/telemetry", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task GetTelemetrySummary_ReturnsLatestValues()
    {
        await EnsureInstrumentExists();
        var dto = new IngestTelemetryRequest(
            _instrumentId,
            DateTime.UtcNow,
            new Dictionary<string, double> { { "temperature", 36.8 } },
            "HTTP");
        await _client.PostAsJsonAsync("/api/v1/telemetry", dto);

        var response = await _client.GetAsync($"/api/v1/telemetry/{_instrumentId}/summary");
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<TelemetrySummaryDto>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
        Assert.NotNull(content.Data);
    }

    [Fact]
    public async Task IngestTelemetryBatch_ValidPayload_ReturnsOk()
    {
        await EnsureInstrumentExists();
        var records = new List<IngestTelemetryRequest>
        {
            new(_instrumentId, DateTime.UtcNow.AddSeconds(-10), new Dictionary<string, double> { { "temp", 25.0 } }, "MQTT"),
            new(_instrumentId, DateTime.UtcNow.AddSeconds(-5), new Dictionary<string, double> { { "temp", 25.5 } }, "MQTT"),
        };
        var dto = new IngestTelemetryBatchRequest(records);

        var response = await _client.PostAsJsonAsync("/api/v1/telemetry/batch", dto);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<IngestBatchResult>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
    }

    [Fact]
    public async Task GetLatestTelemetry_ReturnsRecentRecords()
    {
        await EnsureInstrumentExists();
        var dto = new IngestTelemetryRequest(
            _instrumentId,
            DateTime.UtcNow,
            new Dictionary<string, double> { { "pressure", 1013.25 } },
            "HTTP");
        await _client.PostAsJsonAsync("/api/v1/telemetry", dto);

        var response = await _client.GetAsync($"/api/v1/telemetry/{_instrumentId}/latest?count=10");
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
    }
}
