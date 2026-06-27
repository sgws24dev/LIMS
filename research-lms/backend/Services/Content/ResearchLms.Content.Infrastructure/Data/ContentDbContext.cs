using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Infrastructure.Data;

public class ContentDbContext : DbContext
{
    private readonly ITenantContext _tenantContext;

    public ContentDbContext(DbContextOptions<ContentDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<HelpArticle> HelpArticles => Set<HelpArticle>();
    public DbSet<HelpCategory> HelpCategories => Set<HelpCategory>();
    public DbSet<Walkthrough> Walkthroughs => Set<Walkthrough>();
    public DbSet<WalkthroughStep> WalkthroughSteps => Set<WalkthroughStep>();
    public DbSet<Publication> Publications => Set<Publication>();
    public DbSet<HomepageDefinition> HomepageDefinitions => Set<HomepageDefinition>();
    public DbSet<PublicationInstrumentLink> PublicationInstrumentLinks => Set<PublicationInstrumentLink>();
    public DbSet<UserWalkthroughProgress> UserWalkthroughProgress => Set<UserWalkthroughProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ContentDbContext).Assembly);

        modelBuilder.Entity<HelpArticle>().HasQueryFilter(a => a.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<HelpCategory>().HasQueryFilter(c => c.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<Walkthrough>().HasQueryFilter(w => w.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<WalkthroughStep>().HasQueryFilter(s => s.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<Publication>().HasQueryFilter(p => p.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<HomepageDefinition>().HasQueryFilter(h => h.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<PublicationInstrumentLink>().HasQueryFilter(l => l.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<UserWalkthroughProgress>().HasQueryFilter(p => p.TenantId == _tenantContext.TenantId);
    }
}
