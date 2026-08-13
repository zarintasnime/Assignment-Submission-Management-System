using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class EnrollmentService(
    IApplicationDbContext db,
    IAuditLogService audit) : IEnrollmentService
{
    public async Task<IReadOnlyList<EnrollmentResponse>> GetAllAsync(CancellationToken ct) =>
        await db.StudentEnrollments
            .AsNoTracking()
            .Include(x => x.Student)
            .Include(x => x.ClassRoom)
            .OrderBy(x => x.Student.FullName)
            .Select(x => new EnrollmentResponse(
                x.Id,
                x.StudentId,
                x.Student.FullName,
                x.ClassRoomId,
                x.ClassRoom.Name,
                x.IsActive,
                x.EnrolledAt))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<EnrollmentResponse>> GetForTeacherAsync(Guid teacherId, CancellationToken ct)
    {
        var teacherRoomIds = await db.TeacherAssignments
            .AsNoTracking()
            .Where(x => x.TeacherId == teacherId && x.IsActive)
            .Select(x => x.ClassRoomId)
            .Distinct()
            .ToListAsync(ct);

        return await db.StudentEnrollments
            .AsNoTracking()
            .Include(x => x.Student)
            .Include(x => x.ClassRoom)
            .Where(x => teacherRoomIds.Contains(x.ClassRoomId))
            .OrderBy(x => x.Student.FullName)
            .Select(x => new EnrollmentResponse(
                x.Id,
                x.StudentId,
                x.Student.FullName,
                x.ClassRoomId,
                x.ClassRoom.Name,
                x.IsActive,
                x.EnrolledAt))
            .ToListAsync(ct);
    }

    public async Task<EnrollmentResponse> CreateAsync(
        CreateEnrollmentRequest request,
        CancellationToken ct)
    {
        var student = await db.Users.SingleOrDefaultAsync(x => x.Id == request.StudentId, ct)
            ?? throw new NotFoundException("Student user not found.");

        if (student.Role != UserRole.Student || !student.IsActive)
        {
            throw new BusinessRuleException("Enrollment requires an active Student user.");
        }

        var room = await db.ClassRooms.SingleOrDefaultAsync(x => x.Id == request.ClassRoomId, ct)
            ?? throw new NotFoundException("ClassRoom not found.");

        if (!room.IsActive)
        {
            throw new BusinessRuleException("Cannot enroll into an inactive ClassRoom.");
        }

        var existing = await db.StudentEnrollments.SingleOrDefaultAsync(
            x => x.StudentId == request.StudentId && x.ClassRoomId == request.ClassRoomId,
            ct);

        if (existing is not null)
        {
            if (existing.IsActive)
            {
                throw new ConflictException("Student is already enrolled in this ClassRoom.");
            }

            existing.IsActive = true;
            await db.SaveChangesAsync(ct);

            return new EnrollmentResponse(
                existing.Id,
                student.Id,
                student.FullName,
                room.Id,
                room.Name,
                true,
                existing.EnrolledAt);
        }

        var enrollment = new StudentEnrollment
        {
            StudentId = student.Id,
            ClassRoomId = room.Id
        };

        db.StudentEnrollments.Add(enrollment);
        audit.Add(
            AuditAction.StudentEnrolled,
            nameof(StudentEnrollment),
            enrollment.Id,
            new { StudentId = student.Id, ClassRoomId = room.Id });

        await db.SaveChangesAsync(ct);

        return new EnrollmentResponse(
            enrollment.Id,
            student.Id,
            student.FullName,
            room.Id,
            room.Name,
            enrollment.IsActive,
            enrollment.EnrolledAt);
    }

    public async Task<EnrollmentResponse> TeacherEnrollStudentAsync(
        EnrollStudentByTeacherRequest request,
        Guid teacherId,
        CancellationToken ct)
    {
        // Verify teacher owns an active assignment for this classroom
        var isAssigned = await db.TeacherAssignments.AnyAsync(
            x => x.TeacherId == teacherId && x.ClassRoomId == request.ClassRoomId && x.IsActive,
            ct);

        if (!isAssigned)
        {
            throw new ForbiddenException("You are not assigned to teach this ClassRoom.");
        }

        return await CreateAsync(
            new CreateEnrollmentRequest(request.StudentId, request.ClassRoomId),
            ct);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken ct)
    {
        var enrollment = await db.StudentEnrollments.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Enrollment not found.");

        enrollment.IsActive = false;
        await db.SaveChangesAsync(ct);
    }
}
