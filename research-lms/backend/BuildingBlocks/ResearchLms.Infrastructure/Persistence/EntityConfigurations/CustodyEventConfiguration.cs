using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class CustodyEventConfiguration : IEntityTypeConfiguration<CustodyEvent>
{
    public void Configure(EntityTypeBuilder<CustodyEvent> builder)
    {
        builder.ToTable("CustodyEvents");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.AssetId).IsRequired();
        builder.Property(x => x.FromUserId).HasMaxLength(200);
        builder.Property(x => x.ToUserId).IsRequired().HasMaxLength(200);
        builder.Property(x => x.FromUserName).HasMaxLength(200);
        builder.Property(x => x.ToUserName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.FromLocation).HasMaxLength(300);
        builder.Property(x => x.ToLocation).IsRequired().HasMaxLength(300);
        builder.Property(x => x.Reason).HasMaxLength(1000);
        builder.Property(x => x.SignatureRef).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Notes).HasMaxLength(1000);

        builder.HasOne(x => x.Asset)
            .WithMany()
            .HasForeignKey(x => x.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.AssetId, x.TransferredAt }).IsDescending(false, false, true);
        builder.HasIndex(x => new { x.TenantId, x.ToUserId });
    }
}
