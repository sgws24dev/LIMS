using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class HelpdeskConversationConfiguration : IEntityTypeConfiguration<HelpdeskConversation>
{
    public void Configure(EntityTypeBuilder<HelpdeskConversation> builder)
    {
        builder.ToTable("HelpdeskConversations");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Topic).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(50).IsRequired();

        builder.HasMany(e => e.Messages)
            .WithOne()
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
