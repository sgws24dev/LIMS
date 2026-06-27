using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class HelpdeskMessageConfiguration : IEntityTypeConfiguration<HelpdeskMessage>
{
    public void Configure(EntityTypeBuilder<HelpdeskMessage> builder)
    {
        builder.ToTable("HelpdeskMessages");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Content).IsRequired();
        builder.Property(e => e.Role).HasConversion<string>().HasMaxLength(50).IsRequired();
    }
}
