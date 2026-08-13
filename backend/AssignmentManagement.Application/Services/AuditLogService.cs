using System.Text.Json;
using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Services;

public sealed class AuditLogService(
    IApplicationDbContext db,
    ICurrentUserService currentUser) : IAuditLogService
{
    public void Add(
        AuditAction action,
        string entityType,
        Guid entityId,
        object? metadata = null)
    {
        db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = currentUser.IsAuthenticated ? currentUser.UserId : null,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Metadata = metadata is null ? null : JsonSerializer.Serialize(metadata),
            CreatedAt = DateTime.UtcNow
        });
    }
}
