using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class SubmissionVersionConfiguration : IEntityTypeConfiguration<SubmissionVersion>
{
    public void Configure(EntityTypeBuilder<SubmissionVersion> builder)
    {
        builder.ToTable("SubmissionVersions", table =>
            table.HasCheckConstraint("CK_SubmissionVersions_VersionNo", "\"VersionNo\" > 0"));

        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.SubmissionId, x.VersionNo }).IsUnique();
        builder.Property(x => x.AnswerText).HasMaxLength(20000);

        builder.HasOne(x => x.Submission)
            .WithMany(x => x.SubmissionVersions)
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
