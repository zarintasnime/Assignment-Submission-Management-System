using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Abstractions;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    string Email { get; }
    UserRole Role { get; }
}
