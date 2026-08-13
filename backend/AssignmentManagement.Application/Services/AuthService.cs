using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class AuthService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwt,
    ICurrentUserService currentUser) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == email, ct);

        if (user is null ||
            !user.IsActive ||
            !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAppException("Invalid email/password or inactive account.");
        }

        var token = jwt.Create(user);

        return new LoginResponse(
            token.Token,
            token.ExpiresAtUtc,
            new CurrentUserResponse(user.Id, user.FullName, user.Email, user.Role));
    }

    public async Task<CurrentUserResponse> MeAsync(CancellationToken ct)
    {
        if (!currentUser.IsAuthenticated)
        {
            throw new UnauthorizedAppException("Authentication required.");
        }

        var user = await db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == currentUser.UserId, ct)
            ?? throw new NotFoundException("User not found.");

        if (!user.IsActive)
        {
            throw new UnauthorizedAppException("Account is inactive.");
        }

        return new CurrentUserResponse(user.Id, user.FullName, user.Email, user.Role);
    }
}
