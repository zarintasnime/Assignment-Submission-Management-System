using AssignmentManagement.Infrastructure.Persistence;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace AssignmentManagement.Infrastructure.Persistence.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202608110001_InitialCreate")]
public partial class InitialCreate
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
        modelBuilder.HasAnnotation("ProductVersion", "8.0.8");

        modelBuilder.Entity<User>(builder =>
        {
            builder.ToTable("Users", table =>
                table.HasCheckConstraint(
                    "CK_Users_Role",
                    "\"Role\" IN ('Admin', 'Teacher', 'Student')"));

            builder.HasKey(x => x.Id);
            builder.Property(x => x.FullName).HasMaxLength(150).IsRequired();
            builder.Property(x => x.Email).HasMaxLength(200).IsRequired();
            builder.Property(x => x.PasswordHash).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Role).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.HasIndex(x => x.Email).IsUnique();
            builder.HasIndex(x => x.Role);
        });

        modelBuilder.Entity<ClassRoom>(builder =>
        {
            builder.ToTable("ClassRooms");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.AcademicYear).HasMaxLength(30);
            builder.Property(x => x.Section).HasMaxLength(30);
            builder.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<Subject>(builder =>
        {
            builder.ToTable("Subjects");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<StudentEnrollment>(builder =>
        {
            builder.ToTable("StudentEnrollments");
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => new { x.StudentId, x.ClassRoomId }).IsUnique();

            builder.HasOne(x => x.Student)
                .WithMany(x => x.StudentEnrollments)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ClassRoom)
                .WithMany(x => x.StudentEnrollments)
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeacherAssignment>(builder =>
        {
            builder.ToTable("TeacherAssignments");
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => new { x.TeacherId, x.ClassRoomId, x.SubjectId }).IsUnique();

            builder.HasOne(x => x.Teacher)
                .WithMany(x => x.TeacherAssignments)
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ClassRoom)
                .WithMany(x => x.TeacherAssignments)
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Subject)
                .WithMany(x => x.TeacherAssignments)
                .HasForeignKey(x => x.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Assignment>(builder =>
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
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(5000).IsRequired();
            builder.Property(x => x.MaxMarks).HasPrecision(7, 2);
            builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

            builder.HasOne(x => x.TeacherAssignment)
                .WithMany(x => x.Assignments)
                .HasForeignKey(x => x.TeacherAssignmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Submission>(builder =>
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
        });

        modelBuilder.Entity<SubmissionVersion>(builder =>
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
        });

        modelBuilder.Entity<SubmissionAttachment>(builder =>
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
        });

        modelBuilder.Entity<AuditLog>(builder =>
        {
            builder.ToTable("AuditLogs");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Action).HasConversion<string>().HasMaxLength(80).IsRequired();
            builder.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
            builder.Property(x => x.Metadata).HasColumnType("jsonb");
            builder.HasIndex(x => new { x.EntityType, x.EntityId });

            builder.HasOne(x => x.ActorUser)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.ActorUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
