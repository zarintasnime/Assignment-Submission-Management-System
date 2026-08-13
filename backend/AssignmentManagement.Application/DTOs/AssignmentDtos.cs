using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs;

public sealed record CreateAssignmentRequest(
    Guid TeacherAssignmentId,
    string Title,
    string Description,
    DateTime Deadline,
    decimal MaxMarks,
    bool AllowResubmission = true,
    int GraceMinutes = 0);

public sealed record UpdateAssignmentRequest(
    Guid TeacherAssignmentId,
    string Title,
    string Description,
    DateTime Deadline,
    decimal MaxMarks,
    bool AllowResubmission,
    int GraceMinutes);

public sealed record AssignmentResponse(
    Guid Id,
    Guid TeacherAssignmentId,
    string Title,
    string Description,
    DateTime Deadline,
    decimal MaxMarks,
    AssignmentStatus Status,
    bool AllowResubmission,
    int GraceMinutes,
    DateTime? PublishedAt,
    string ClassRoom,
    string Subject,
    string Teacher);
