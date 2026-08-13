using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class TeacherAssignmentService(
    IApplicationDbContext db,
    IAuditLogService audit,
    ICurrentUserService currentUser) : ITeacherAssignmentService
{
    private static IQueryable<TeacherAssignment> Query(IApplicationDbContext db) =>
        db.TeacherAssignments
            .AsNoTracking()
            .Include(x => x.Teacher)
            .Include(x => x.ClassRoom)
            .Include(x => x.Subject);

    public async Task<IReadOnlyList<TeacherAssignmentResponse>> GetAllAsync(CancellationToken ct)
    {
        var items = await Query(db)
            .OrderBy(x => x.Teacher.FullName)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<TeacherAssignmentResponse>> GetMineAsync(CancellationToken ct)
    {
        var items = await Query(db)
            .Where(x =>
                x.TeacherId == currentUser.UserId &&
                x.IsActive &&
                x.Teacher.IsActive &&
                x.ClassRoom.IsActive &&
                x.Subject.IsActive)
            .OrderBy(x => x.ClassRoom.Code)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<TeacherAssignmentResponse> CreateAsync(
        CreateTeacherAssignmentRequest request,
        CancellationToken ct)
    {
        var teacher = await db.Users.SingleOrDefaultAsync(x => x.Id == request.TeacherId, ct)
            ?? throw new NotFoundException("Teacher user not found.");

        if (teacher.Role != UserRole.Teacher || !teacher.IsActive)
        {
            throw new BusinessRuleException("Mapping requires an active Teacher user.");
        }

        var room = await db.ClassRooms.SingleOrDefaultAsync(x => x.Id == request.ClassRoomId, ct)
            ?? throw new NotFoundException("ClassRoom not found.");

        var subject = await db.Subjects.SingleOrDefaultAsync(x => x.Id == request.SubjectId, ct)
            ?? throw new NotFoundException("Subject not found.");

        if (!room.IsActive || !subject.IsActive)
        {
            throw new BusinessRuleException("ClassRoom and Subject must be active.");
        }

        if (subject.ClassRoomId.HasValue && subject.ClassRoomId.Value != room.Id)
        {
            throw new BusinessRuleException($"Subject '{subject.Name}' ({subject.Code}) does not belong to the selected ClassRoom.");
        }

        var existing = await db.TeacherAssignments.SingleOrDefaultAsync(
            x =>
                x.TeacherId == request.TeacherId &&
                x.ClassRoomId == request.ClassRoomId &&
                x.SubjectId == request.SubjectId,
            ct);

        if (existing is not null)
        {
            if (existing.IsActive)
            {
                throw new ConflictException("Teacher mapping already exists.");
            }

            existing.IsActive = true;
            existing.DeactivatedAt = null;
            await db.SaveChangesAsync(ct);

            return new TeacherAssignmentResponse(
                existing.Id,
                teacher.Id,
                teacher.FullName,
                room.Id,
                room.Name,
                subject.Id,
                subject.Name,
                true,
                existing.AssignedAt);
        }

        var mapping = new TeacherAssignment
        {
            TeacherId = teacher.Id,
            ClassRoomId = room.Id,
            SubjectId = subject.Id
        };

        db.TeacherAssignments.Add(mapping);
        audit.Add(
            AuditAction.TeacherMapped,
            nameof(TeacherAssignment),
            mapping.Id,
            new { TeacherId = teacher.Id, ClassRoomId = room.Id, SubjectId = subject.Id });

        await db.SaveChangesAsync(ct);

        return new TeacherAssignmentResponse(
            mapping.Id,
            teacher.Id,
            teacher.FullName,
            room.Id,
            room.Name,
            subject.Id,
            subject.Name,
            mapping.IsActive,
            mapping.AssignedAt);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken ct)
    {
        var mapping = await db.TeacherAssignments.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Teacher mapping not found.");

        mapping.IsActive = false;
        mapping.DeactivatedAt = DateTime.UtcNow;

        audit.Add(
            AuditAction.TeacherMappingDeactivated,
            nameof(TeacherAssignment),
            mapping.Id);

        await db.SaveChangesAsync(ct);
    }

    private static TeacherAssignmentResponse Map(TeacherAssignment x) =>
        new(
            x.Id,
            x.TeacherId,
            x.Teacher.FullName,
            x.ClassRoomId,
            x.ClassRoom.Name,
            x.SubjectId,
            x.Subject.Name,
            x.IsActive,
            x.AssignedAt);
}
