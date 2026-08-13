using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions", table =>
        {
            table.HasCheckConstraint("CK_Submissions_CurrentVersion", "\"CurrentVersion\" > 0");
            table.HasCheckConstraint("CK_Submissions_Marks", "\"Marks\" IS NULL OR \"Marks\" >= 0");
            table.HasCheckConstraint(
                "CK_Submissions_Status",
                "\"Status\" IN ('Submitted', 'Graded', 'Returned')");
        });

        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.AssignmentId, x.StudentId }).IsUnique();

        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.Marks).HasPrecision(7, 2);
        builder.Property(x => x.Feedback).HasMaxLength(4000);

        builder.HasOne(x => x.Assignment)
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.AssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Student)
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.GradedByTeacher)
            .WithMany(x => x.GradedSubmissions)
            .HasForeignKey(x => x.GradedByTeacherId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
