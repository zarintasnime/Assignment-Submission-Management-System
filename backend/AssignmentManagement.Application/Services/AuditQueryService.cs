using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class AuditQueryService(IApplicationDbContext db) : IAuditQueryService
{
    public async Task<IReadOnlyList<AuditLogResponse>> GetLatestAsync(
        int take,
        CancellationToken ct)
    {
        take = Math.Clamp(take, 1, 200);

        var logs = await db.AuditLogs
            .AsNoTracking()
            .Include(x => x.ActorUser)
            .OrderByDescending(x => x.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

        return logs
            .Select(x => new AuditLogResponse(
                x.Id,
                x.ActorUserId,
                x.ActorUser?.FullName,
                x.Action.ToString(),
                x.EntityType,
                x.EntityId,
                x.Metadata,
                x.CreatedAt))
            .ToList();
    }
}
