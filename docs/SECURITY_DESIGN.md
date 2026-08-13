# Security Design

## Authentication

- Passwords are hashed with BCrypt; plaintext passwords are never persisted.
- JWT validates issuer, audience, expiry and signing key.
- Claims: UserId (`NameIdentifier`), Email, FullName and Role.
- Login rejects inactive accounts.
- JWT validation performs an active-user database check so a deactivated/deleted user cannot keep using an already-issued token until expiry.
- No public registration endpoint accepts a caller-selected role. Admin creates managed accounts.

## Authorization

Role authorization is the first gate; resource ownership/business context is the second gate in the Application layer.

- **Admin** manages users, ClassRooms, Subjects, enrollments, teacher mappings and oversight.
- **Teacher assignment authoring:** the referenced `TeacherAssignment.TeacherId` must equal JWT UserId, and the mapping/teacher/class/subject must be active.
- **Teacher grading:** `Submission.Assignment.TeacherAssignment.TeacherId` must equal JWT UserId.
- **Student assignment access:** active `StudentEnrollment.ClassRoomId` must match the assignment mapping ClassRoom.
- **Student submission access/resubmit:** `Submission.StudentId` must equal JWT UserId.

The frontend does not send TeacherId/StudentId for self-resource operations; identity comes from the JWT. IDs are accepted only in Admin-managed mapping/enrollment operations.

## IDOR Resistance

Knowing a valid GUID is not enough to access a resource. Service methods re-check ownership/enrollment before returning or modifying records. Cross-teacher and cross-student paths are rejected independently of UI routing.

## Secrets

Real deployment secrets must not be committed. `.env.example` documents expected variables. Docker Compose defaults and `appsettings.Development.json` are explicitly local-development-only values for this recruitment demo and must be replaced in production.

## Logging

The request logger records method/path/status/timing without logging authorization headers, passwords, JWTs, submission answers or uploaded-file contents. Unexpected exceptions are logged server-side with a trace id; clients receive sanitized Problem Details.
