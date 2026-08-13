using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<ClassRoom> ClassRooms { get; }
    DbSet<Subject> Subjects { get; }
    DbSet<StudentEnrollment> StudentEnrollments { get; }
    DbSet<TeacherAssignment> TeacherAssignments { get; }
    DbSet<Assignment> Assignments { get; }
    DbSet<Submission> Submissions { get; }
    DbSet<SubmissionVersion> SubmissionVersions { get; }
    DbSet<SubmissionAttachment> SubmissionAttachments { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
