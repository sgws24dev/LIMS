using System.Dynamic;
using System.Linq.Dynamic.Core;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Services.ReportServices;

public class ReportService : IReportService
{
    private readonly BillingDbContext _dbContext;
    private readonly DynamicQueryBuilder _queryBuilder;
    private readonly ITenantContext _tenantContext;

    private static readonly Dictionary<string, Func<BillingDbContext, IQueryable>> EntitySources = new()
    {
        ["Invoice"] = ctx => ctx.Invoices.AsQueryable(),
        ["InvoiceLineItem"] = ctx => ctx.InvoiceLineItems.AsQueryable(),
    };

    public ReportService(BillingDbContext dbContext, DynamicQueryBuilder queryBuilder, ITenantContext tenantContext)
    {
        _dbContext = dbContext;
        _queryBuilder = queryBuilder;
        _tenantContext = tenantContext;
    }

    public async Task<ReportPreview> PreviewAsync(ReportDefinition definition, CancellationToken ct = default)
    {
        var query = BuildEntityQuery(definition);
        var results = _queryBuilder.BuildQuery(query, definition);
        var totalCount = await results.CountAsync(ct);
        var rows = await results.Take(100).ToListAsync(ct);
        var columns = definition.GetFields().Select(f => f.DisplayName).ToList();

        return new ReportPreview(columns, rows, totalCount);
    }

    public async Task<ReportResult> RunAsync(ReportDefinition definition, int page = 1, int pageSize = 100, CancellationToken ct = default)
    {
        var query = BuildEntityQuery(definition);
        var results = _queryBuilder.BuildQuery(query, definition);
        var totalCount = await results.CountAsync(ct);
        var rows = await results.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        var columns = definition.GetFields().Select(f => f.DisplayName).ToList();

        return new ReportResult(columns, rows, totalCount);
    }

    private IQueryable BuildEntityQuery(ReportDefinition definition)
    {
        if (!EntitySources.TryGetValue(definition.SourceEntity, out var sourceFactory))
            throw new InvalidOperationException($"Unknown source entity: {definition.SourceEntity}");

        IQueryable query = sourceFactory(_dbContext);

        var entityName = definition.SourceEntity;
        query = ApplyFilter(query, $"{entityName}.TenantId == @0", new object[] { _tenantContext.TenantId });
        query = ApplyFilter(query, $"{entityName}.IsDeleted == false", Array.Empty<object>());

        return query;
    }

    private static IQueryable ApplyFilter(IQueryable query, string predicate, object[] args)
    {
        return DynamicQueryableExtensions.Where(query, predicate, args);
    }
}
