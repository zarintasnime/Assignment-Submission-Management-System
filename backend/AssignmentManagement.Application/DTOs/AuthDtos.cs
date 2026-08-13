using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs;

public sealed record LoginRequest(string Email, string Password);

public sealed record CurrentUserResponse(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role);

public sealed record LoginResponse(
    string Token,
    DateTime ExpiresAtUtc,
    CurrentUserResponse User);
