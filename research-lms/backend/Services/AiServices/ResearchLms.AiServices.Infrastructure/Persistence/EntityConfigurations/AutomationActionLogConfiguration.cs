using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class AutomationActionLogConfiguration : IEntityTypeConfiguration<AutomationActionLog>
{
    public void Configure(EntityTypeBuilder<AutomationActionLog> builder)
    {
        builder.ToTable("AutomationActionLogs");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.TriggerEvent).HasMaxLength(8000);
        builder.Property(e => e.ActionExecuted).HasMaxLength(8000);
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired();
    }
}
