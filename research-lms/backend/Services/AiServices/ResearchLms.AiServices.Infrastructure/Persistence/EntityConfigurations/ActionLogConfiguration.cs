using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class ActionLogConfiguration : IEntityTypeConfiguration<ActionLog>
{
    public void Configure(EntityTypeBuilder<ActionLog> builder)
    {
        builder.ToTable("ActionLogs");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Utterance).IsRequired().HasMaxLength(4000);
        builder.Property(e => e.Intent).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ParametersJson).HasMaxLength(8000);
        builder.Property(e => e.GuardrailResultJson).HasMaxLength(8000);
        builder.Property(e => e.ExecutionResultJson).HasMaxLength(8000);
        builder.Property(e => e.Status).IsRequired().HasMaxLength(50);
    }
}
