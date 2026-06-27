using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Content.Application.Services;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Infrastructure.Data;
using ResearchLms.Content.Infrastructure.Data.Repositories;
using ResearchLms.Content.Infrastructure.Services;
using ResearchLms.Infrastructure.Contexts;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddContentInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMemoryCache();
        services.AddScoped<ITenantContext, TenantContext>();

        services.AddDbContext<ContentDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("ContentDb")));

        services.AddScoped<IHelpArticleRepository, HelpArticleRepository>();
        services.AddScoped<IHelpCategoryRepository, HelpCategoryRepository>();
        services.AddScoped<IWalkthroughRepository, WalkthroughRepository>();
        services.AddScoped<IUserWalkthroughProgressRepository, UserWalkthroughProgressRepository>();
        services.AddScoped<IPublicationRepository, PublicationRepository>();
        services.AddScoped<IHomepageRepository, HomepageRepository>();

        services.AddHttpClient<IElasticsearchIndexingService, ElasticsearchIndexingService>(client =>
        {
            client.BaseAddress = new Uri(configuration["Elasticsearch:Url"] ?? "http://localhost:9200");
        });

        services.AddHttpClient<IDoiService, CrossRefDoiService>();

        return services;
    }
}
