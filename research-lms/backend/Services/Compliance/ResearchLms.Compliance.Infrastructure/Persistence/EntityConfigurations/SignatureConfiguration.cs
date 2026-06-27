using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Compliance.Domain.Entities;

namespace ResearchLms.Compliance.Infrastructure.Persistence.EntityConfigurations;

public class SignatureConfiguration : IEntityTypeConfiguration<Signature>
{
    public void Configure(EntityTypeBuilder<Signature> builder)
    {
        builder.ToTable("Signatures");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.SignedEntityType).HasMaxLength(200).IsRequired();
        builder.Property(e => e.SignerUserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.SignerName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.SignerEmail).HasMaxLength(200).IsRequired();
        builder.Property(e => e.SignatureData).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(e => e.DocumentHash).HasMaxLength(64).IsRequired();
        builder.Property(e => e.IpAddress).HasMaxLength(50);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.SignedEntityType, e.SignedEntityId });
    }
}
