using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class PublicationInstrumentLinkConfiguration : IEntityTypeConfiguration<PublicationInstrumentLink>
{
    public void Configure(EntityTypeBuilder<PublicationInstrumentLink> builder)
    {
        builder.ToTable("PublicationInstrumentLinks");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.PublicationId).IsRequired();
        builder.Property(l => l.InstrumentId).IsRequired();

        builder.HasIndex(l => new { l.PublicationId, l.InstrumentId }).IsUnique();
        builder.HasIndex(l => new { l.TenantId, l.InstrumentId });
    }
}
