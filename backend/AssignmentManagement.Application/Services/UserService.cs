using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class UserService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IAuditLogService audit) : IUserService
{
    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken ct) =>
        await db.Users
            .AsNoTracking()
            .OrderBy(x => x.Role)
            .ThenBy(x => x.FullName)
            .Select(x => new UserResponse(
                x.Id,
                x.FullName,
                x.Email,
                x.Role,
                x.IsActive,
                x.CreatedAt))
            .ToListAsync(ct);

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(x => x.Email == email, ct))
        {
            throw new ConflictException("A user with this email already exists.");
        }

        if (!Enum.IsDefined(typeof(UserRole), request.Role))
        {
            throw new BusinessRuleException("Invalid role.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = request.Role,
            IsActive = true
        };

        db.Users.Add(user);
        audit.Add(
            AuditAction.UserCreated,
            nameof(User),
            user.Id,
            new { user.Email, Role = user.Role.ToString() });

        await db.SaveChangesAsync(ct);
        return Map(user);
    }

    public async Task<UserResponse> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("User not found.");

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var cleanEmail = request.Email.Trim().ToLowerInvariant();
            if (cleanEmail != user.Email)
            {
                if (await db.Users.AnyAsync(x => x.Email == cleanEmail && x.Id != id, ct))
                {
                    throw new ConflictException("A user with this email address already exists.");
                }
                user.Email = cleanEmail;
            }
        }

        if (request.Role.HasValue && request.Role.Value != user.Role)
        {
            if (!Enum.IsDefined(typeof(UserRole), request.Role.Value))
            {
                throw new BusinessRuleException("Invalid role selected.");
            }

            // Protect against demoting or disabling the sole active admin
            if (user.Role == UserRole.Admin && request.Role.Value != UserRole.Admin)
            {
                var otherActiveAdminCount = await db.Users.CountAsync(
                    x => x.Role == UserRole.Admin && x.IsActive && x.Id != id, ct);
                
                if (otherActiveAdminCount == 0)
                {
                    throw new BusinessRuleException("Cannot demote the sole active administrator account.");
                }
            }

            user.Role = request.Role.Value;
        }

        // Protect against deactivating sole active admin
        if (!request.IsActive && user.IsActive && user.Role == UserRole.Admin)
        {
            var otherActiveAdminCount = await db.Users.CountAsync(
                x => x.Role == UserRole.Admin && x.IsActive && x.Id != id, ct);
            
            if (otherActiveAdminCount == 0)
            {
                throw new BusinessRuleException("Cannot deactivate the sole active administrator account.");
            }
        }

        user.FullName = request.FullName.Trim();
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        audit.Add(
            AuditAction.UserUpdated,
            nameof(User),
            user.Id,
            new { user.Email, Role = user.Role.ToString(), user.IsActive });

        await db.SaveChangesAsync(ct);
        return Map(user);
    }

    private static UserResponse Map(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role, user.IsActive, user.CreatedAt);
}
