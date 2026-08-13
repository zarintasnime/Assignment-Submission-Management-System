namespace AssignmentManagement.Domain.Enums;

public enum AuditAction
{
    UserCreated = 1,
    UserUpdated = 2,
    ClassRoomCreated = 3,
    SubjectCreated = 4,
    StudentEnrolled = 5,
    TeacherMapped = 6,
    TeacherMappingDeactivated = 7,
    AssignmentCreated = 8,
    AssignmentUpdated = 9,
    AssignmentPublished = 10,
    AssignmentArchived = 11,
    SubmissionCreated = 12,
    SubmissionResubmitted = 13,
    SubmissionGraded = 14,
    SubmissionReturned = 15,
    AssignmentDeleted = 16
}
