using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class GuardrailConfigConfiguration : IEntityTypeConfiguration<GuardrailConfig>
{
    public void Configure(EntityTypeBuilder<GuardrailConfig> builder)
    {
        builder.ToTable("GuardrailConfig");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ActionType).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ApproverRolesJson).HasColumnName("ApproverRoles").HasMaxLength(2000);
        builder.HasIndex(e => new { e.TenantId, e.ActionType }).IsUnique();
    }
}
