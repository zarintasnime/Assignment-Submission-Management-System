namespace AssignmentManagement.Application.DTOs;

public sealed record DashboardResponse(
    string Role,
    int Users,
    int Classes,
    int Subjects,
    int Assignments,
    int PublishedAssignments,
    int Submissions,
    int UngradedSubmissions);

public sealed record AuditLogResponse(
    Guid Id,
    Guid? ActorUserId,
    string? ActorName,
    string Action,
    string EntityType,
    Guid EntityId,
    string? Metadata,
    DateTime CreatedAt);
