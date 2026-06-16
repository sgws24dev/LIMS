using Elasticsearch.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nest;

namespace ResearchLms.Infrastructure.Search;

public static class ElasticsearchExtensions
{
    public static IServiceCollection AddElasticsearch(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var url = configuration.GetValue<string>("Elasticsearch:Url") ?? "http://localhost:9200";
        var defaultIndex = configuration.GetValue<string>("Elasticsearch:DefaultIndex") ?? "research-lms";

        var settings = new ConnectionSettings(new Uri(url))
            .DefaultIndex(defaultIndex)
            .EnableDebugMode();

        var client = new ElasticClient(settings);
        services.AddSingleton<IElasticClient>(client);
        return services;
    }
}
