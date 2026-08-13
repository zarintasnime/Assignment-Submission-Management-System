using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Rules;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class AssignmentService(
    IApplicationDbContext db,
    ICurrentUserService currentUser,
    IAuditLogService audit) : IAssignmentService
{
    private IQueryable<Assignment> BaseQuery() =>
        db.Assignments
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Teacher)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.ClassRoom)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Subject);

    public async Task<IReadOnlyList<AssignmentResponse>> GetMineForTeacherAsync(CancellationToken ct)
    {
        var items = await BaseQuery()
            .AsNoTracking()
            .Where(x => x.TeacherAssignment.TeacherId == currentUser.UserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        return MapList(items);
    }

    public async Task<IReadOnlyList<AssignmentResponse>> GetEligibleForStudentAsync(CancellationToken ct)
    {
        var roomIds = await db.StudentEnrollments
            .AsNoTracking()
            .Where(x => x.StudentId == currentUser.UserId && x.IsActive)
            .Select(x => x.ClassRoomId)
            .ToListAsync(ct);

        var items = await BaseQuery()
            .AsNoTracking()
            .Where(x =>
                roomIds.Contains(x.TeacherAssignment.ClassRoomId) &&
                x.Status == AssignmentStatus.Published)
            .OrderBy(x => x.Deadline)
            .ToListAsync(ct);

        return MapList(items);
    }

    public async Task<AssignmentResponse> GetStudentDetailAsync(Guid id, CancellationToken ct)
    {
        var assignment = await BaseQuery()
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        // Hiding non-published assignments as 404 avoids leaking resources that students cannot access.
        if (assignment.Status != AssignmentStatus.Published)
        {
            throw new NotFoundException("Assignment not found.");
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

        return Map(assignment);
    }

    public async Task<IReadOnlyList<AssignmentResponse>> GetAllForAdminAsync(CancellationToken ct)
    {
        var items = await BaseQuery()
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        return MapList(items);
    }

    public async Task<AssignmentResponse> CreateAsync(CreateAssignmentRequest request, CancellationToken ct)
    {
        var mapping = await LoadOwnedMappingAsync(request.TeacherAssignmentId, ct);
        var deadlineUtc = NormalizeToUtc(request.Deadline);

        if (deadlineUtc <= DateTime.UtcNow)
        {
            throw new BusinessRuleException("Deadline must be in the future.");
        }

        var assignment = new Assignment
        {
            TeacherAssignmentId = mapping.Id,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Deadline = deadlineUtc,
            MaxMarks = request.MaxMarks,
            AllowResubmission = request.AllowResubmission,
            GraceMinutes = request.GraceMinutes,
            Status = AssignmentStatus.Draft
        };

        db.Assignments.Add(assignment);
        audit.Add(
            AuditAction.AssignmentCreated,
            nameof(Assignment),
            assignment.Id,
            new { assignment.Title });

        await db.SaveChangesAsync(ct);
        assignment.TeacherAssignment = mapping;

        return Map(assignment);
    }

    public async Task<AssignmentResponse> UpdateAsync(
        Guid id,
        UpdateAssignmentRequest request,
        CancellationToken ct)
    {
        var assignment = await LoadOwnedAssignmentAsync(id, ct);
        BusinessRules.EnsureDraft(assignment.Status);

        var mapping = await LoadOwnedMappingAsync(request.TeacherAssignmentId, ct);
        var deadlineUtc = NormalizeToUtc(request.Deadline);

        if (deadlineUtc <= DateTime.UtcNow)
        {
            throw new BusinessRuleException("Deadline must be in the future.");
        }

        assignment.TeacherAssignmentId = mapping.Id;
        assignment.TeacherAssignment = mapping;
        assignment.Title = request.Title.Trim();
        assignment.Description = request.Description.Trim();
        assignment.Deadline = deadlineUtc;
        assignment.MaxMarks = request.MaxMarks;
        assignment.AllowResubmission = request.AllowResubmission;
        assignment.GraceMinutes = request.GraceMinutes;
        assignment.UpdatedAt = DateTime.UtcNow;

        audit.Add(AuditAction.AssignmentUpdated, nameof(Assignment), assignment.Id);
        await db.SaveChangesAsync(ct);

        return Map(assignment);
    }

    public async Task<AssignmentResponse> PublishAsync(Guid id, CancellationToken ct)
    {
        var assignment = await LoadOwnedAssignmentAsync(id, ct);
        BusinessRules.EnsureDraft(assignment.Status);

        if (!assignment.TeacherAssignment.IsActive)
        {
            throw new BusinessRuleException("Teacher mapping is inactive.");
        }

        if (assignment.Deadline <= DateTime.UtcNow)
        {
            throw new BusinessRuleException("Cannot publish an assignment with an expired deadline.");
        }

        assignment.Status = AssignmentStatus.Published;
        assignment.PublishedAt = DateTime.UtcNow;
        assignment.UpdatedAt = DateTime.UtcNow;

        audit.Add(AuditAction.AssignmentPublished, nameof(Assignment), assignment.Id);
        await db.SaveChangesAsync(ct);

        return Map(assignment);
    }

    public async Task ArchiveAsync(Guid id, CancellationToken ct)
    {
        var assignment = await LoadOwnedAssignmentAsync(id, ct);

        assignment.Status = AssignmentStatus.Archived;
        assignment.ArchivedAt = DateTime.UtcNow;
        assignment.UpdatedAt = DateTime.UtcNow;

        audit.Add(AuditAction.AssignmentArchived, nameof(Assignment), assignment.Id);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteDraftAsync(Guid id, CancellationToken ct)
    {
        var assignment = await LoadOwnedAssignmentAsync(id, ct);
        BusinessRules.EnsureDraft(assignment.Status);

        var hasSubmissions = await db.Submissions.AnyAsync(
            x => x.AssignmentId == assignment.Id,
            ct);

        if (hasSubmissions)
        {
            throw new ConflictException("Assignment with submissions cannot be deleted.");
        }

        db.Assignments.Remove(assignment);
        audit.Add(AuditAction.AssignmentDeleted, nameof(Assignment), assignment.Id);
        await db.SaveChangesAsync(ct);
    }

    private async Task<Assignment> LoadOwnedAssignmentAsync(Guid id, CancellationToken ct)
    {
        var assignment = await BaseQuery()
            .SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.TeacherAssignment.TeacherId != currentUser.UserId)
        {
            throw new ForbiddenException("You do not own this assignment.");
        }

        return assignment;
    }

    private async Task<TeacherAssignment> LoadOwnedMappingAsync(Guid id, CancellationToken ct)
    {
        var mapping = await db.TeacherAssignments
            .Include(x => x.Teacher)
            .Include(x => x.ClassRoom)
            .Include(x => x.Subject)
            .SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Teacher mapping not found.");

        if (mapping.TeacherId != currentUser.UserId)
        {
            throw new ForbiddenException("You do not own this teacher mapping.");
        }

        if (!mapping.IsActive ||
            !mapping.Teacher.IsActive ||
            !mapping.ClassRoom.IsActive ||
            !mapping.Subject.IsActive)
        {
            throw new BusinessRuleException(
                "The teacher mapping, teacher, classroom and subject must all be active.");
        }

        return mapping;
    }

    /// <summary>
    /// A client may send a UTC instant, an offset, or a bare local timestamp. Everything is
    /// converted to a single UTC instant BEFORE any comparison, so the deadline rule never
    /// depends on the timezone of the machine running the API.
    /// </summary>
    private static DateTime NormalizeToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };

    private static AssignmentResponse Map(Assignment assignment) =>
        new(
            assignment.Id,
            assignment.TeacherAssignmentId,
            assignment.Title,
            assignment.Description,
            assignment.Deadline,
            assignment.MaxMarks,
            assignment.Status,
            assignment.AllowResubmission,
            assignment.GraceMinutes,
            assignment.PublishedAt,
            assignment.TeacherAssignment.ClassRoom.Name,
            assignment.TeacherAssignment.Subject.Name,
            assignment.TeacherAssignment.Teacher.FullName);

    private static IReadOnlyList<AssignmentResponse> MapList(IEnumerable<Assignment> assignments) =>
        assignments.Select(Map).ToList();
}
