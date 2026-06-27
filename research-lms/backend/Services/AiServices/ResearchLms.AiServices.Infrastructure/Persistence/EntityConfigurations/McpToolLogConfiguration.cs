using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class McpToolLogConfiguration : IEntityTypeConfiguration<McpToolLog>
{
    public void Configure(EntityTypeBuilder<McpToolLog> builder)
    {
        builder.ToTable("McpToolLogs");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ToolName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.InputJson).IsRequired();
        builder.Property(e => e.ResultJson).IsRequired();
    }
}
