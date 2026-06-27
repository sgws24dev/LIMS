using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Communications.Domain.Entities;

namespace ResearchLms.Communications.Infrastructure.Persistence.EntityConfigurations;

public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("NotificationTemplates");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Channel).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(x => x.Subject).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Body).IsRequired();
    }
}
