using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class InstrumentApiKeyConfiguration : IEntityTypeConfiguration<InstrumentApiKey>
{
    public void Configure(EntityTypeBuilder<InstrumentApiKey> builder)
    {
        builder.ToTable("InstrumentApiKeys");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ApiKeyHash).HasMaxLength(256).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.HasIndex(e => e.ApiKeyHash).IsUnique();
    }
}
