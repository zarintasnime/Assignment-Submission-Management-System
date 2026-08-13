using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class DashboardService(
    IApplicationDbContext db,
    ICurrentUserService currentUser) : IDashboardService
{
    public async Task<DashboardResponse> GetAsync(CancellationToken ct)
    {
        return currentUser.Role switch
        {
            UserRole.Admin => await GetAdminDashboardAsync(ct),
            UserRole.Teacher => await GetTeacherDashboardAsync(ct),
            UserRole.Student => await GetStudentDashboardAsync(ct),
            _ => throw new InvalidOperationException("Unsupported role.")
        };
    }

    private async Task<DashboardResponse> GetAdminDashboardAsync(CancellationToken ct) =>
        new(
            "Admin",
            await db.Users.CountAsync(ct),
            await db.ClassRooms.CountAsync(ct),
            await db.Subjects.CountAsync(ct),
            await db.Assignments.CountAsync(ct),
            await db.Assignments.CountAsync(x => x.Status == AssignmentStatus.Published, ct),
            await db.Submissions.CountAsync(ct),
            await db.Submissions.CountAsync(x => x.Status == SubmissionStatus.Submitted, ct));

    private async Task<DashboardResponse> GetTeacherDashboardAsync(CancellationToken ct)
    {
        var assignmentIds = await db.Assignments
            .Where(x => x.TeacherAssignment.TeacherId == currentUser.UserId)
            .Select(x => x.Id)
            .ToListAsync(ct);

        var publishedCount = await db.Assignments.CountAsync(
            x =>
                x.TeacherAssignment.TeacherId == currentUser.UserId &&
                x.Status == AssignmentStatus.Published,
            ct);

        var submissionCount = await db.Submissions.CountAsync(
            x => assignmentIds.Contains(x.AssignmentId),
            ct);

        var ungradedCount = await db.Submissions.CountAsync(
            x =>
                assignmentIds.Contains(x.AssignmentId) &&
                x.Status == SubmissionStatus.Submitted,
            ct);

        return new DashboardResponse(
            "Teacher",
            0,
            0,
            0,
            assignmentIds.Count,
            publishedCount,
            submissionCount,
            ungradedCount);
    }

    private async Task<DashboardResponse> GetStudentDashboardAsync(CancellationToken ct)
    {
        var roomIds = await db.StudentEnrollments
            .Where(x => x.StudentId == currentUser.UserId && x.IsActive)
            .Select(x => x.ClassRoomId)
            .ToListAsync(ct);

        var eligibleAssignmentCount = await db.Assignments.CountAsync(
            x =>
                roomIds.Contains(x.TeacherAssignment.ClassRoomId) &&
                x.Status == AssignmentStatus.Published,
            ct);

        var submissionCount = await db.Submissions.CountAsync(
            x => x.StudentId == currentUser.UserId,
            ct);

        var pendingGradeCount = await db.Submissions.CountAsync(
            x =>
                x.StudentId == currentUser.UserId &&
                x.Status == SubmissionStatus.Submitted,
            ct);

        return new DashboardResponse(
            "Student",
            0,
            roomIds.Count,
            0,
            eligibleAssignmentCount,
            eligibleAssignmentCount,
            submissionCount,
            pendingGradeCount);
    }
}
