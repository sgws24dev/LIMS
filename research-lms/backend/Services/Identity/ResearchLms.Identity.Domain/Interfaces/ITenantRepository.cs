namespace ResearchLms.Identity.Domain.Interfaces;

using ResearchLms.Shared.Domain.Entities;

/// <summary>Repository abstraction for <see cref="Tenant"/> persistence.</summary>
public interface ITenantRepository
{
    /// <summary>Gets a tenant by its unique identifier.</summary>
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Gets a tenant by its custom domain.</summary>
    Task<Tenant?> GetByDomainAsync(string domain, CancellationToken cancellationToken = default);

    /// <summary>Gets a tenant by its unique code slug.</summary>
    Task<Tenant?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>Gets all tenants.</summary>
    Task<IReadOnlyList<Tenant>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Adds a new tenant.</summary>
    Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing tenant.</summary>
    Task UpdateAsync(Tenant tenant, CancellationToken cancellationToken = default);

    /// <summary>Checks whether a tenant with the given code or domain already exists.</summary>
    Task<bool> ExistsAsync(string code, CancellationToken cancellationToken = default);
}
