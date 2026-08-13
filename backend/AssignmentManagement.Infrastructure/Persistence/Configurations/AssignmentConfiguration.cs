using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.ToTable("Assignments", table =>
        {
            table.HasCheckConstraint("CK_Assignments_MaxMarks", "\"MaxMarks\" > 0");
            table.HasCheckConstraint("CK_Assignments_GraceMinutes", "\"GraceMinutes\" >= 0");
            table.HasCheckConstraint(
                "CK_Assignments_Status",
                "\"Status\" IN ('Draft', 'Published', 'Closed', 'Archived')");
        });

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(5000).IsRequired();
        builder.Property(x => x.MaxMarks).HasPrecision(7, 2);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

        builder.HasIndex(x => x.Status);

        // TeacherAssignment is the canonical Teacher + ClassRoom + Subject relationship.
        // Keeping a single FK here prevents inconsistent duplicate foreign keys on Assignment.
        builder.HasOne(x => x.TeacherAssignment)
            .WithMany(x => x.Assignments)
            .HasForeignKey(x => x.TeacherAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
