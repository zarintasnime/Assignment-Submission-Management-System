# Final ERD / FK Source of Truth

```mermaid
erDiagram
    User ||--o{ StudentEnrollment : student
    ClassRoom ||--o{ StudentEnrollment : contains
    User ||--o{ TeacherAssignment : teacher
    ClassRoom ||--o{ TeacherAssignment : class
    Subject ||--o{ TeacherAssignment : subject
    TeacherAssignment ||--o{ Assignment : authorizes
    Assignment ||--o{ Submission : receives
    User ||--o{ Submission : student
    User |o--o{ Submission : grader
    Submission ||--o{ SubmissionVersion : versions
    SubmissionVersion ||--o{ SubmissionAttachment : attachments
    User |o--o{ AuditLog : actor
```

## Exact Foreign Keys

| Child | FK | Parent | Delete |
|---|---|---|---|
| StudentEnrollment | StudentId | User.Id | Restrict |
| StudentEnrollment | ClassRoomId | ClassRoom.Id | Restrict |
| TeacherAssignment | TeacherId | User.Id | Restrict |
| TeacherAssignment | ClassRoomId | ClassRoom.Id | Restrict |
| TeacherAssignment | SubjectId | Subject.Id | Restrict |
| Assignment | TeacherAssignmentId | TeacherAssignment.Id | Restrict |
| Submission | AssignmentId | Assignment.Id | Restrict |
| Submission | StudentId | User.Id | Restrict |
| Submission | GradedByTeacherId | User.Id | SetNull |
| SubmissionVersion | SubmissionId | Submission.Id | Cascade |
| SubmissionAttachment | SubmissionVersionId | SubmissionVersion.Id | Cascade |
| AuditLog | ActorUserId | User.Id | SetNull |

## Important Unique Indexes

- User.Email
- ClassRoom.Code
- Subject.Code
- StudentEnrollment(StudentId, ClassRoomId)
- TeacherAssignment(TeacherId, ClassRoomId, SubjectId)
- Submission(AssignmentId, StudentId)
- SubmissionVersion(SubmissionId, VersionNo)

`Assignment` intentionally does **not** duplicate TeacherId/ClassRoomId/SubjectId. `SubmissionAttachment` intentionally does **not** contain SubmissionId.
