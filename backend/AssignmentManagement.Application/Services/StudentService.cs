using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class StudentService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IAuditLogService audit,
    ICurrentUserService currentUser) : IStudentService
{
    public async Task<IReadOnlyList<StudentResponse>> GetAllStudentsAsync(CancellationToken ct) =>
        await db.Users
            .AsNoTracking()
            .Where(x => x.Role == UserRole.Student)
            .OrderBy(x => x.FullName)
            .Select(x => new StudentResponse(
                x.Id,
                x.FullName,
                x.Email,
                x.Role,
                x.IsActive,
                x.CreatedAt))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<StudentResponse>> GetTeacherStudentsAsync(CancellationToken ct)
    {
        var teacherId = currentUser.UserId;

        // Find classrooms assigned to this teacher
        var teacherRoomIds = await db.TeacherAssignments
            .AsNoTracking()
            .Where(x => x.TeacherId == teacherId && x.IsActive)
            .Select(x => x.ClassRoomId)
            .Distinct()
            .ToListAsync(ct);

        return await db.StudentEnrollments
            .AsNoTracking()
            .Where(x => teacherRoomIds.Contains(x.ClassRoomId) && x.IsActive && x.Student.IsActive)
            .Select(x => x.Student)
            .Distinct()
            .OrderBy(x => x.FullName)
            .Select(x => new StudentResponse(
                x.Id,
                x.FullName,
                x.Email,
                x.Role,
                x.IsActive,
                x.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<StudentResponse> CreateStudentAsync(CreateStudentRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(x => x.Email == email, ct))
        {
            throw new ConflictException("A user with this email already exists.");
        }

        var student = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = UserRole.Student,
            IsActive = true
        };

        db.Users.Add(student);
        audit.Add(
            AuditAction.UserCreated,
            nameof(User),
            student.Id,
            new { student.Email, Role = student.Role.ToString() });

        await db.SaveChangesAsync(ct);
        return Map(student);
    }

    public async Task<StudentResponse> UpdateStudentAsync(
        Guid id,
        UpdateStudentRequest request,
        CancellationToken ct)
    {
        var student = await db.Users.SingleOrDefaultAsync(x => x.Id == id && x.Role == UserRole.Student, ct)
            ?? throw new NotFoundException("Student user not found.");

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var cleanEmail = request.Email.Trim().ToLowerInvariant();
            if (cleanEmail != student.Email)
            {
                if (await db.Users.AnyAsync(x => x.Email == cleanEmail && x.Id != id, ct))
                {
                    throw new ConflictException("A user with this email address already exists.");
                }
                student.Email = cleanEmail;
            }
        }

        if (request.Role.HasValue && request.Role.Value != student.Role)
        {
            if (!Enum.IsDefined(typeof(UserRole), request.Role.Value))
            {
                throw new BusinessRuleException("Invalid role selected.");
            }
            student.Role = request.Role.Value;
        }

        student.FullName = request.FullName.Trim();
        student.IsActive = request.IsActive;
        student.UpdatedAt = DateTime.UtcNow;

        audit.Add(
            AuditAction.UserUpdated,
            nameof(User),
            student.Id,
            new { student.Email, student.IsActive, Role = student.Role.ToString() });

        await db.SaveChangesAsync(ct);
        return Map(student);
    }

    private static StudentResponse Map(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role, user.IsActive, user.CreatedAt);
}
