using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class SubmissionAttachmentConfiguration : IEntityTypeConfiguration<SubmissionAttachment>
{
    public void Configure(EntityTypeBuilder<SubmissionAttachment> builder)
    {
        builder.ToTable("SubmissionAttachments", table =>
            table.HasCheckConstraint("CK_SubmissionAttachments_FileSize", "\"FileSize\" > 0"));

        builder.HasKey(x => x.Id);
        builder.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.StoredFileName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.ContentType).HasMaxLength(150).IsRequired();
        builder.Property(x => x.FileUrl).HasMaxLength(1000).IsRequired();

        builder.HasOne(x => x.SubmissionVersion)
            .WithMany(x => x.SubmissionAttachments)
            .HasForeignKey(x => x.SubmissionVersionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
