using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class HelpdeskTicketConfiguration : IEntityTypeConfiguration<HelpdeskTicket>
{
    public void Configure(EntityTypeBuilder<HelpdeskTicket> builder)
    {
        builder.ToTable("HelpdeskTickets");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ConversationSummary).HasMaxLength(2000).IsRequired();
        builder.Property(e => e.Priority).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(e => e.Category).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(50).IsRequired();
    }
}
