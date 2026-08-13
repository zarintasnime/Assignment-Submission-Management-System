using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Rules;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class GradingService(
    IApplicationDbContext db,
    ICurrentUserService currentUser,
    IAuditLogService audit) : IGradingService
{
    private IQueryable<Submission> BaseQuery() =>
        db.Submissions
            .Include(x => x.Student)
            .Include(x => x.Assignment)
                .ThenInclude(x => x.TeacherAssignment)
            .Include(x => x.SubmissionVersions.OrderBy(v => v.VersionNo));

    public async Task<IReadOnlyList<SubmissionResponse>> GetForAssignmentAsync(
        Guid assignmentId,
        CancellationToken ct)
    {
        var assignment = await db.Assignments
            .Include(x => x.TeacherAssignment)
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == assignmentId, ct)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.TeacherAssignment.TeacherId != currentUser.UserId)
        {
            throw new ForbiddenException(
                "You can only view submissions for your own assignments.");
        }

        var submissions = await BaseQuery()
            .AsNoTracking()
            .Where(x => x.AssignmentId == assignmentId)
            .OrderBy(x => x.Student.FullName)
            .ToListAsync(ct);

        return submissions.Select(SubmissionService.Map).ToList();
    }

    public async Task<SubmissionResponse> GradeAsync(
        Guid submissionId,
        GradeSubmissionRequest request,
        CancellationToken ct)
    {
        var submission = await LoadOwnedSubmissionAsync(submissionId, ct);
        BusinessRules.EnsureGrade(request.Marks, submission.Assignment.MaxMarks);

        submission.Marks = request.Marks;
        submission.Feedback = request.Feedback?.Trim();
        submission.GradedAt = DateTime.UtcNow;
        submission.GradedByTeacherId = currentUser.UserId;
        submission.Status = SubmissionStatus.Graded;
        submission.UpdatedAt = DateTime.UtcNow;

        audit.Add(
            AuditAction.SubmissionGraded,
            nameof(Submission),
            submission.Id,
            new { request.Marks, MaxMarks = submission.Assignment.MaxMarks });

        await db.SaveChangesAsync(ct);
        return SubmissionService.Map(submission);
    }

    public async Task<SubmissionResponse> ReturnAsync(
        Guid submissionId,
        ReturnSubmissionRequest request,
        CancellationToken ct)
    {
        var submission = await LoadOwnedSubmissionAsync(submissionId, ct);

        submission.Status = SubmissionStatus.Returned;
        submission.Marks = null;
        submission.Feedback = request.Feedback.Trim();
        submission.GradedAt = null;
        submission.GradedByTeacherId = null;
        submission.UpdatedAt = DateTime.UtcNow;

        audit.Add(AuditAction.SubmissionReturned, nameof(Submission), submission.Id);
        await db.SaveChangesAsync(ct);

        return SubmissionService.Map(submission);
    }

    private async Task<Submission> LoadOwnedSubmissionAsync(Guid submissionId, CancellationToken ct)
    {
        var submission = await BaseQuery()
            .SingleOrDefaultAsync(x => x.Id == submissionId, ct)
            ?? throw new NotFoundException("Submission not found.");

        if (submission.Assignment.TeacherAssignment.TeacherId != currentUser.UserId)
        {
            throw new ForbiddenException("You cannot manage another teacher's submission.");
        }

        return submission;
    }
}
