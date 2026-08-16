using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Rules;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class SubmissionService(
    IApplicationDbContext db,
    ICurrentUserService currentUser,
    IAuditLogService audit) : ISubmissionService
{
    private IQueryable<Submission> BaseQuery() =>
        db.Submissions
            .Include(x => x.Student)
            .Include(x => x.Assignment)
                .ThenInclude(x => x.TeacherAssignment)
                    .ThenInclude(x => x.ClassRoom)
            .Include(x => x.SubmissionVersions.OrderBy(v => v.VersionNo));

    public async Task<SubmissionResponse> SubmitAsync(
        Guid assignmentId,
        SubmitSubmissionRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.AnswerText))
        {
            throw new BusinessRuleException("AnswerText is required in this MVP.");
        }

        var assignment = await db.Assignments
            .Include(x => x.TeacherAssignment)
            .SingleOrDefaultAsync(x => x.Id == assignmentId, ct)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.Status != AssignmentStatus.Published)
        {
            throw new BusinessRuleException("Only published assignments accept submissions.");
        }

        if (!assignment.TeacherAssignment.IsActive)
        {
            throw new BusinessRuleException("Teacher assignment mapping is no longer active.");
        }

        var enrolled = await db.StudentEnrollments.AnyAsync(
            x =>
                x.StudentId == currentUser.UserId &&
                x.IsActive &&
                x.ClassRoomId == assignment.TeacherAssignment.ClassRoomId,
            ct);

        if (!enrolled)
        {
            throw new ForbiddenException("You are not enrolled in this assignment's ClassRoom.");
        }

        var alreadySubmitted = await db.Submissions.AnyAsync(
            x => x.AssignmentId == assignmentId && x.StudentId == currentUser.UserId,
            ct);

        if (alreadySubmitted)
        {
            throw new ConflictException(
                "A submission lifecycle already exists. Use resubmit instead.");
        }

        var now = DateTime.UtcNow;
        BusinessRules.EnsureSubmissionWindow(now, assignment.Deadline, assignment.GraceMinutes);

        var submission = new Submission
        {
            AssignmentId = assignment.Id,
            StudentId = currentUser.UserId,
            Status = SubmissionStatus.Submitted,
            IsLate = BusinessRules.IsLate(now, assignment.Deadline),
            CurrentVersion = 1,
            FirstSubmittedAt = now,
            LastSubmittedAt = now,
            UpdatedAt = now
        };

        submission.SubmissionVersions.Add(new SubmissionVersion
        {
            VersionNo = 1,
            AnswerText = request.AnswerText.Trim(),
            SubmittedAt = now
        });

        db.Submissions.Add(submission);
        audit.Add(
            AuditAction.SubmissionCreated,
            nameof(Submission),
            submission.Id,
            new { assignment.Id, Version = 1, submission.IsLate });

        await db.SaveChangesAsync(ct);
        return await GetMineDetailAsync(submission.Id, ct);
    }

    public async Task<SubmissionResponse> ResubmitAsync(
        Guid submissionId,
        SubmitSubmissionRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.AnswerText))
        {
            throw new BusinessRuleException("AnswerText is required in this MVP.");
        }

        var submission = await BaseQuery()
            .SingleOrDefaultAsync(x => x.Id == submissionId, ct)
            ?? throw new NotFoundException("Submission not found.");

        if (submission.StudentId != currentUser.UserId)
        {
            throw new ForbiddenException("You can only resubmit your own submission.");
        }

        var assignment = submission.Assignment;
        if (assignment.Status != AssignmentStatus.Published)
        {
            throw new BusinessRuleException("This assignment is not open for resubmission.");
        }

        if (!assignment.TeacherAssignment.IsActive)
        {
            throw new BusinessRuleException("Teacher assignment mapping is no longer active.");
        }

        // Eligibility is re-checked on every write: a student unenrolled after their first
        // submission must not be able to keep adding versions.
        var stillEnrolled = await db.StudentEnrollments.AnyAsync(
            x =>
                x.StudentId == currentUser.UserId &&
                x.IsActive &&
                x.ClassRoomId == assignment.TeacherAssignment.ClassRoomId,
            ct);

        if (!stillEnrolled)
        {
            throw new ForbiddenException("You are no longer enrolled in this assignment's ClassRoom.");
        }

        var now = DateTime.UtcNow;
        BusinessRules.EnsureCanResubmit(
            assignment.AllowResubmission,
            now,
            assignment.Deadline,
            assignment.GraceMinutes);

        var nextVersion = submission.CurrentVersion + 1;
        var version = new SubmissionVersion
        {
            SubmissionId = submission.Id,
            VersionNo = nextVersion,
            AnswerText = request.AnswerText.Trim(),
            SubmittedAt = now
        };

        // The submission aggregate is tracked, so adding via DbSet
        db.SubmissionVersions.Add(version);

        submission.CurrentVersion = nextVersion;
        submission.LastSubmittedAt = now;
        submission.IsLate = BusinessRules.IsLate(now, assignment.Deadline);
        submission.Status = SubmissionStatus.Submitted;

        // A previous grade belongs to the previous answer version. The history remains immutable,
        // but the current version must be evaluated again by the teacher.
        submission.Marks = null;
        submission.Feedback = null;
        submission.GradedAt = null;
        submission.GradedByTeacherId = null;
        submission.UpdatedAt = now;

        audit.Add(
            AuditAction.SubmissionResubmitted,
            nameof(Submission),
            submission.Id,
            new { Version = nextVersion, PreviousGradeInvalidated = true });

        await db.SaveChangesAsync(ct);
        return await GetMineDetailAsync(submission.Id, ct);
    }

    public async Task<IReadOnlyList<SubmissionResponse>> GetMineAsync(CancellationToken ct)
    {
        var items = await BaseQuery()
            .AsNoTracking()
            .Where(x => x.StudentId == currentUser.UserId)
            .OrderByDescending(x => x.LastSubmittedAt)
            .ToListAsync(ct);

        return MapList(items);
    }

    public async Task<SubmissionResponse> GetMineDetailAsync(Guid submissionId, CancellationToken ct)
    {
        var submission = await BaseQuery()
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == submissionId, ct)
            ?? throw new NotFoundException("Submission not found.");

        if (submission.StudentId != currentUser.UserId)
        {
            throw new ForbiddenException("You can only access your own submission.");
        }

        return Map(submission);
    }

    public async Task<IReadOnlyList<SubmissionResponse>> GetAllForAdminAsync(CancellationToken ct)
    {
        var items = await BaseQuery()
            .AsNoTracking()
            .OrderByDescending(x => x.LastSubmittedAt)
            .ToListAsync(ct);

        return MapList(items);
    }

    internal static SubmissionResponse Map(Submission submission) =>
        new(
            submission.Id,
            submission.AssignmentId,
            submission.Assignment.Title,
            submission.StudentId,
            submission.Student.FullName,
            submission.Status,
            submission.IsLate,
            submission.CurrentVersion,
            submission.FirstSubmittedAt,
            submission.LastSubmittedAt,
            submission.Marks,
            submission.Assignment.MaxMarks,
            submission.Feedback,
            submission.GradedAt,
            submission.SubmissionVersions
                .OrderBy(v => v.VersionNo)
                .Select(v => new SubmissionVersionResponse(v.VersionNo, v.AnswerText, v.SubmittedAt))
                .ToList());

    private static IReadOnlyList<SubmissionResponse> MapList(IEnumerable<Submission> submissions) =>
        submissions.Select(Map).ToList();
}
