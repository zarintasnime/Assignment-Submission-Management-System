using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<CurrentUserResponse> MeAsync(CancellationToken ct);
}

public interface IUserService
{
    Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken ct);
    Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct);
    Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct);
}

public interface ITeacherService
{
    Task<IReadOnlyList<TeacherResponse>> GetAllTeachersAsync(CancellationToken ct);
    Task<TeacherResponse> CreateTeacherAsync(CreateTeacherRequest request, CancellationToken ct);
    Task<TeacherResponse> UpdateTeacherAsync(Guid id, UpdateTeacherRequest request, CancellationToken ct);
}

public interface IStudentService
{
    Task<IReadOnlyList<StudentResponse>> GetAllStudentsAsync(CancellationToken ct);
    Task<IReadOnlyList<StudentResponse>> GetTeacherStudentsAsync(CancellationToken ct);
    Task<StudentResponse> CreateStudentAsync(CreateStudentRequest request, CancellationToken ct);
    Task<StudentResponse> UpdateStudentAsync(Guid id, UpdateStudentRequest request, CancellationToken ct);
}

public interface IClassRoomService
{
    Task<IReadOnlyList<ClassRoomResponse>> GetAllAsync(CancellationToken ct);
    Task<ClassRoomResponse> CreateAsync(CreateClassRoomRequest request, CancellationToken ct);
    Task<ClassRoomResponse> UpdateAsync(Guid id, UpdateClassRoomRequest request, CancellationToken ct);
}

public interface ISubjectService
{
    Task<IReadOnlyList<SubjectResponse>> GetAllAsync(CancellationToken ct);
    Task<SubjectResponse> CreateAsync(CreateSubjectRequest request, CancellationToken ct);
    Task<SubjectResponse> UpdateAsync(Guid id, UpdateSubjectRequest request, CancellationToken ct);
}

public interface IEnrollmentService
{
    Task<IReadOnlyList<EnrollmentResponse>> GetAllAsync(CancellationToken ct);
    Task<IReadOnlyList<EnrollmentResponse>> GetForTeacherAsync(Guid teacherId, CancellationToken ct);
    Task<EnrollmentResponse> CreateAsync(CreateEnrollmentRequest request, CancellationToken ct);
    Task<EnrollmentResponse> TeacherEnrollStudentAsync(EnrollStudentByTeacherRequest request, Guid teacherId, CancellationToken ct);
    Task DeactivateAsync(Guid id, CancellationToken ct);
}

public interface ITeacherAssignmentService
{
    Task<IReadOnlyList<TeacherAssignmentResponse>> GetAllAsync(CancellationToken ct);
    Task<IReadOnlyList<TeacherAssignmentResponse>> GetMineAsync(CancellationToken ct);
    Task<TeacherAssignmentResponse> CreateAsync(
        CreateTeacherAssignmentRequest request,
        CancellationToken ct);
    Task DeactivateAsync(Guid id, CancellationToken ct);
}

public interface IAssignmentService
{
    Task<IReadOnlyList<AssignmentResponse>> GetMineForTeacherAsync(CancellationToken ct);
    Task<IReadOnlyList<AssignmentResponse>> GetEligibleForStudentAsync(CancellationToken ct);
    Task<AssignmentResponse> GetStudentDetailAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<AssignmentResponse>> GetAllForAdminAsync(CancellationToken ct);
    Task<AssignmentResponse> CreateAsync(CreateAssignmentRequest request, CancellationToken ct);
    Task<AssignmentResponse> UpdateAsync(
        Guid id,
        UpdateAssignmentRequest request,
        CancellationToken ct);
    Task<AssignmentResponse> PublishAsync(Guid id, CancellationToken ct);
    Task ArchiveAsync(Guid id, CancellationToken ct);
    Task DeleteDraftAsync(Guid id, CancellationToken ct);
}

public interface ISubmissionService
{
    Task<SubmissionResponse> SubmitAsync(
        Guid assignmentId,
        SubmitSubmissionRequest request,
        CancellationToken ct);
    Task<SubmissionResponse> ResubmitAsync(
        Guid submissionId,
        SubmitSubmissionRequest request,
        CancellationToken ct);
    Task<IReadOnlyList<SubmissionResponse>> GetMineAsync(CancellationToken ct);
    Task<SubmissionResponse> GetMineDetailAsync(Guid submissionId, CancellationToken ct);
    Task<IReadOnlyList<SubmissionResponse>> GetAllForAdminAsync(CancellationToken ct);
}

public interface IGradingService
{
    Task<IReadOnlyList<SubmissionResponse>> GetForAssignmentAsync(
        Guid assignmentId,
        CancellationToken ct);
    Task<SubmissionResponse> GradeAsync(
        Guid submissionId,
        GradeSubmissionRequest request,
        CancellationToken ct);
    Task<SubmissionResponse> ReturnAsync(
        Guid submissionId,
        ReturnSubmissionRequest request,
        CancellationToken ct);
}

public interface IDashboardService
{
    Task<DashboardResponse> GetAsync(CancellationToken ct);
}

public interface IAuditQueryService
{
    Task<IReadOnlyList<AuditLogResponse>> GetLatestAsync(int take, CancellationToken ct);
}
