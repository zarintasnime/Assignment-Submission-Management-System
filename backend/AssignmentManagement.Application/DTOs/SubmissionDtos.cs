using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs;

public sealed record SubmitSubmissionRequest(string? AnswerText);

public sealed record GradeSubmissionRequest(
    decimal Marks,
    string? Feedback);

public sealed record ReturnSubmissionRequest(string Feedback);

public sealed record SubmissionVersionResponse(
    int VersionNo,
    string? AnswerText,
    DateTime SubmittedAt);

public sealed record SubmissionResponse(
    Guid Id,
    Guid AssignmentId,
    string AssignmentTitle,
    Guid StudentId,
    string StudentName,
    SubmissionStatus Status,
    bool IsLate,
    int CurrentVersion,
    DateTime FirstSubmittedAt,
    DateTime LastSubmittedAt,
    decimal? Marks,
    decimal MaxMarks,
    string? Feedback,
    DateTime? GradedAt,
    IReadOnlyList<SubmissionVersionResponse> Versions);
