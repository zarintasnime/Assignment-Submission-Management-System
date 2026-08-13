using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs;

public sealed record CreateUserRequest(
    string FullName,
    string Email,
    string Password,
    UserRole Role);

public sealed record UpdateUserRequest(
    string FullName,
    bool IsActive,
    UserRole? Role = null,
    string? Email = null);

public sealed record UserResponse(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAt);

// Teacher DTOs
public sealed record CreateTeacherRequest(
    string FullName,
    string Email,
    string Password);

public sealed record UpdateTeacherRequest(
    string FullName,
    bool IsActive,
    UserRole? Role = null,
    string? Email = null);

public sealed record TeacherResponse(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAt);

// Student DTOs
public sealed record CreateStudentRequest(
    string FullName,
    string Email,
    string Password);

public sealed record UpdateStudentRequest(
    string FullName,
    bool IsActive,
    UserRole? Role = null,
    string? Email = null);

public sealed record StudentResponse(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAt);

public sealed record EnrollStudentByTeacherRequest(
    Guid StudentId,
    Guid ClassRoomId);
