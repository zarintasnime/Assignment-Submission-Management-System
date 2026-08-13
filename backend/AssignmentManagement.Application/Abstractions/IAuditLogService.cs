using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Abstractions;

public interface IAuditLogService
{
    void Add(AuditAction action, string entityType, Guid entityId, object? metadata = null);
}
