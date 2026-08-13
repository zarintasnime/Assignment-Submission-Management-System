# Design Decisions

This document records the choices that are most likely to come up in a technical interview.

## Why does `Assignment` reference `TeacherAssignmentId` instead of storing TeacherId + ClassRoomId + SubjectId?

`TeacherAssignment` is the validated teaching context: one teacher, one classroom and one subject. Referencing that single mapping prevents duplicated foreign keys from drifting into contradictory combinations. Authorization also becomes clearer: a teacher can create an assignment only when the referenced mapping is active and belongs to the authenticated teacher.

## Why keep a grace window?

A hard deadline is sometimes too brittle for a real submission workflow. `GraceMinutes` provides a small, explicit tolerance for upload/network/timing issues. It does **not** hide lateness: any submission after the main deadline records `IsLate = true`, and submissions after `Deadline + GraceMinutes` are rejected.

## Why clear a grade after resubmission?

A grade describes the answer version that the teacher evaluated. If the student creates a new answer version, carrying the old marks forward would incorrectly imply that the new content was already reviewed. Therefore the version history remains immutable, while the current `Marks`, `Feedback`, `GradedAt` and `GradedByTeacherId` are cleared and status returns to `Submitted`.

## Why separate `Submission` and `SubmissionVersion`?

`Submission` is the lifecycle identity for one `(Assignment, Student)` pair. `SubmissionVersion` is immutable answer history. This gives a stable row for grading/status while preserving every resubmission for auditability instead of overwriting text.

## Why is `IsLate` separate from submission status?

`Submitted`, `Graded` and `Returned` describe workflow state. Lateness is an independent fact. Combining them would create awkward states such as `LateGraded` and `LateReturned`. A boolean keeps the model orthogonal and queryable.

## Why enforce ownership in services when controllers already have role authorization?

A role only answers “what kind of user is this?” It does not answer “does this user own this record?” Service-level checks prevent IDOR-style access such as one Teacher grading another Teacher's submission or one Student reading another Student's submission.

## Why derive Student/Teacher identity from JWT rather than request payloads?

A caller-controlled `StudentId` or `TeacherId` can be tampered with. For self-resource operations, the API uses the authenticated `NameIdentifier` claim as the source of truth. IDs are accepted only where an Admin intentionally manages another user.

## Why restrictive deletes for academic data?

Assignments, mappings, submissions and grades are historical academic records. Cascading core relationships could silently destroy history. Core relationships therefore use `Restrict`/deactivation; cascade is limited to the natural ownership chain `Submission -> SubmissionVersion -> SubmissionAttachment`.

## Why Docker Compose?

Docker is the reproducible evaluation/integration path, not a substitute for understanding the application. It lets PostgreSQL, the ASP.NET Core API and the Next.js frontend start with one command using known versions and networking. During development, PostgreSQL can remain in Docker while API debugging happens in Visual Studio and Next.js runs with its dev server.

## Why not add more enterprise layers/features?

The recruitment scope is intentionally bounded. The project includes enough separation for testability and maintainability, but avoids unnecessary multi-tenant hierarchy, message brokers, refresh-token infrastructure or generic repository abstractions that do not improve the required assignment workflow.
