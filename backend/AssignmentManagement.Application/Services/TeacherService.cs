using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class TeacherService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IAuditLogService audit) : ITeacherService
{
    public async Task<IReadOnlyList<TeacherResponse>> GetAllTeachersAsync(CancellationToken ct) =>
        await db.Users
            .AsNoTracking()
            .Where(x => x.Role == UserRole.Teacher)
            .OrderBy(x => x.FullName)
            .Select(x => new TeacherResponse(
                x.Id,
                x.FullName,
                x.Email,
                x.Role,
                x.IsActive,
                x.CreatedAt))
            .ToListAsync(ct);

    public async Task<TeacherResponse> CreateTeacherAsync(CreateTeacherRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(x => x.Email == email, ct))
        {
            throw new ConflictException("A user with this email already exists.");
        }

        var teacher = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = UserRole.Teacher,
            IsActive = true
        };

        db.Users.Add(teacher);
        audit.Add(
            AuditAction.UserCreated,
            nameof(User),
            teacher.Id,
            new { teacher.Email, Role = teacher.Role.ToString() });

        await db.SaveChangesAsync(ct);
        return Map(teacher);
    }

    public async Task<TeacherResponse> UpdateTeacherAsync(
        Guid id,
        UpdateTeacherRequest request,
        CancellationToken ct)
    {
        var teacher = await db.Users.SingleOrDefaultAsync(x => x.Id == id && x.Role == UserRole.Teacher, ct)
            ?? throw new NotFoundException("Teacher user not found.");

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var cleanEmail = request.Email.Trim().ToLowerInvariant();
            if (cleanEmail != teacher.Email)
            {
                if (await db.Users.AnyAsync(x => x.Email == cleanEmail && x.Id != id, ct))
                {
                    throw new ConflictException("A user with this email address already exists.");
                }
                teacher.Email = cleanEmail;
            }
        }

        if (request.Role.HasValue && request.Role.Value != teacher.Role)
        {
            if (!Enum.IsDefined(typeof(UserRole), request.Role.Value))
            {
                throw new BusinessRuleException("Invalid role selected.");
            }
            teacher.Role = request.Role.Value;
        }

        teacher.FullName = request.FullName.Trim();
        teacher.IsActive = request.IsActive;
        teacher.UpdatedAt = DateTime.UtcNow;

        audit.Add(
            AuditAction.UserUpdated,
            nameof(User),
            teacher.Id,
            new { teacher.Email, teacher.IsActive, Role = teacher.Role.ToString() });

        await db.SaveChangesAsync(ct);
        return Map(teacher);
    }

    private static TeacherResponse Map(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role, user.IsActive, user.CreatedAt);
}
