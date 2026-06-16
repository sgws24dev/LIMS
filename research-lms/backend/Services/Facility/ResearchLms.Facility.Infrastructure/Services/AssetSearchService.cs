using Nest;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Facilities.Application.Mappings;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Search;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Services;

public class AssetSearchService : IAssetSearchService
{
    private readonly ISearchService _searchService;
    private readonly IAssetRepository _repository;
    private readonly ITenantContext _tenantContext;

    public AssetSearchService(ISearchService searchService, IAssetRepository repository, ITenantContext tenantContext)
    {
        _searchService = searchService;
        _repository = repository;
        _tenantContext = tenantContext;
    }

    private string IndexName => $"research-lms-assets-{_tenantContext.TenantId}";

    public async Task<AssetPagedResult> SearchAsync(AssetSearchParams @params, CancellationToken ct)
    {
        try
        {
            var results = await _searchService.SearchAsync<AssetIndexDocument>(IndexName, @params.Query ?? "*");
            var ids = results.Select(r => Guid.Parse(r.Id)).ToList();
            var assets = new List<AssetDto>();

            foreach (var id in ids)
            {
                var asset = await _repository.GetByIdAsync(id, ct);
                if (asset is not null)
                    assets.Add(AssetMapping.ToDto(asset));
            }

            return new AssetPagedResult(assets, assets.Count);
        }
        catch
        {
            // Fallback to EF Core query
            var result = await _repository.GetAllAsync(
                @params.Query, @params.Category, @params.Status,
                @params.FacilityId, @params.Page, @params.PageSize, ct);

            return new AssetPagedResult(
                result.Items.Select(AssetMapping.ToDto).ToList(),
                result.TotalCount);
        }
    }

    public async Task IndexAsync(Asset asset, CancellationToken ct)
    {
        var doc = new AssetIndexDocument(
            asset.Id.ToString(),
            asset.TenantId.ToString(),
            asset.Name,
            asset.Identifier,
            asset.Category,
            asset.AssetType,
            asset.Status.ToString(),
            asset.Location ?? "",
            asset.FacilityId.ToString(),
            asset.Manufacturer ?? "",
            asset.Model ?? "",
            asset.CustomFields);

        await _searchService.IndexAsync(IndexName, doc);
    }

    public async Task DeleteIndexAsync(Guid assetId, CancellationToken ct)
    {
        var client = GetElasticClient();
        await client.DeleteAsync<AssetIndexDocument>(assetId.ToString(), d => d.Index(IndexName));
    }

    private IElasticClient GetElasticClient()
    {
        // Accessed via the injected ISearchService — delete uses raw client
        var settings = new ConnectionSettings(new Uri("http://localhost:9200"));
        return new ElasticClient(settings);
    }
}

public record AssetIndexDocument(
    string Id,
    string TenantId,
    string Name,
    string Identifier,
    string Category,
    string AssetType,
    string Status,
    string Location,
    string FacilityId,
    string Manufacturer,
    string Model,
    Dictionary<string, string> CustomFields);
