using Microsoft.EntityFrameworkCore;
using ResearchLms.Infrastructure.Contexts;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(ResearchLmsDbContext context, ITenantContext tenantContext)
    {
        if (await context.Tenants.IgnoreQueryFilters().AnyAsync())
            return;

        if (tenantContext is TenantContext tc)
            tc.SetTenant(Guid.Empty, "master");

        var passwordHasher = new PasswordHasher();

        var tenant = Tenant.Create("Master Tenant", "master", null, "admin@researchlms.com");

        var allModules = new[]
        {
            "users", "roles", "tenants", "institutions", "facilities",
            "labs", "equipment", "samples", "experiments", "trainings",
            "bookings", "billing", "reports", "audit", "settings"
        };

        var adminRole = Role.Create("System Administrator", "Full system access", true);

        foreach (var module in allModules)
        {
            var perm = new Permission(module, true, true, true, true);
            adminRole.AddPermission(perm);
        }

        var institutionAdminRole = Role.Create("Institution Admin", "Manages a single institution", false);
        foreach (var module in allModules.Where(m => m != "tenants" && m != "audit"))
        {
            var perm = new Permission(module, true, true, true, true);
            institutionAdminRole.AddPermission(perm);
        }

        var piRole = Role.Create("Principal Investigator", "Manages experiments and samples", false);
        foreach (var module in new[] { "samples", "experiments", "equipment", "bookings", "reports" })
        {
            var perm = new Permission(module, true, true, true, false);
            piRole.AddPermission(perm);
        }

        var trainerRole = Role.Create("Trainer", "Conducts trainings", false);
        var trainerPerm = new Permission("trainings", true, true, true, false);
        trainerRole.AddPermission(trainerPerm);

        var researcherRole = Role.Create("Researcher", "Conducts research", false);
        foreach (var module in new[] { "samples", "experiments", "equipment", "bookings" })
        {
            var perm = new Permission(module, true, true, false, false);
            researcherRole.AddPermission(perm);
        }

        var studentRole = Role.Create("Student", "Limited access for learning", false);
        var studentViewPerm = new Permission("experiments", true, false, false, false);
        studentRole.AddPermission(studentViewPerm);

        var technicianRole = Role.Create("Technician", "Maintains equipment and facilities", false);
        foreach (var module in new[] { "equipment", "facilities", "labs" })
        {
            var perm = new Permission(module, true, false, true, false);
            technicianRole.AddPermission(perm);
        }

        var billingRole = Role.Create("Billing Admin", "Manages billing", false);
        var billingPerm = new Permission("billing", true, true, true, true);
        billingRole.AddPermission(billingPerm);

        var adminUser = User.Create("admin@researchlms.com", passwordHasher.Hash("Admin@123!"), "System", "Administrator");

        var refreshToken = new RefreshToken(
            adminUser.Id,
            Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)),
            DateTime.UtcNow.AddDays(90),
            "seed");
        adminUser.AddRefreshToken(refreshToken);

        var adminUserRole = new UserRole(adminUser.Id, adminRole.Id, "system");

        context.Tenants.Add(tenant);
        context.Roles.Add(adminRole);
        context.Roles.Add(institutionAdminRole);
        context.Roles.Add(piRole);
        context.Roles.Add(trainerRole);
        context.Roles.Add(researcherRole);
        context.Roles.Add(studentRole);
        context.Roles.Add(technicianRole);
        context.Roles.Add(billingRole);
        context.Users.Add(adminUser);
        context.UserRoles.Add(adminUserRole);

        await context.SaveChangesAsync();
    }

    private sealed class PasswordHasher
    {
        public string Hash(string password)
        {
            var bytes = System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(password + "ResearchLmsSalt"));
            return Convert.ToBase64String(bytes);
        }
    }
}
