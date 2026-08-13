namespace AssignmentManagement.Application.DTOs;

public sealed record CreateClassRoomRequest(
    string Name,
    string Code,
    string? AcademicYear,
    string? Section);

public sealed record UpdateClassRoomRequest(
    string Name,
    string? AcademicYear,
    string? Section,
    bool IsActive);

public sealed record ClassRoomResponse(
    Guid Id,
    string Name,
    string Code,
    string? AcademicYear,
    string? Section,
    bool IsActive);

public sealed record CreateSubjectRequest(
    string Name,
    string Code,
    Guid? ClassRoomId = null);

public sealed record UpdateSubjectRequest(
    string Name,
    bool IsActive,
    Guid? ClassRoomId = null);

public sealed record SubjectResponse(
    Guid Id,
    string Name,
    string Code,
    bool IsActive,
    Guid? ClassRoomId = null,
    string? ClassRoomName = null);

public sealed record CreateEnrollmentRequest(
    Guid StudentId,
    Guid ClassRoomId);

public sealed record EnrollmentResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    Guid ClassRoomId,
    string ClassRoomName,
    bool IsActive,
    DateTime EnrolledAt);

public sealed record CreateTeacherAssignmentRequest(
    Guid TeacherId,
    Guid ClassRoomId,
    Guid SubjectId);

public sealed record TeacherAssignmentResponse(
    Guid Id,
    Guid TeacherId,
    string TeacherName,
    Guid ClassRoomId,
    string ClassRoomName,
    Guid SubjectId,
    string SubjectName,
    bool IsActive,
    DateTime AssignedAt);
