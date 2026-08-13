using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions;

public interface IJwtTokenService
{
    TokenResult Create(User user);
}

public sealed record TokenResult(string Token, DateTime ExpiresAtUtc);
