🚀 Assignment & Submission Management System

Full-Stack Academic Workflow Platform

A recruitment-focused full-stack school/college assignment workflow
built with ASP.NET Core 8 Web API, C#, EF Core 8, PostgreSQL,
JWT/BCrypt, Next.js + React + TypeScript, xUnit, Swagger and Docker
Compose.

The project is deliberately scoped around one complete business flow:
Admin configures the academic structure → Teacher creates/publishes
assignments → Student submits/resubmits → Teacher grades/returns work →
Student sees marks and feedback.

Every change made in this revision, and the reason for it, is listed in
docs/CHANGES_APPLIED.md.

Quick Start --- Docker (recommended for evaluation)

Prerequisite: Docker Desktop / Docker Engine with Compose support.

docker compose up --build -d
docker compose ps

Open:

Frontend: http://localhost:3000

Swagger: http://localhost:8081/swagger

Health: http://localhost:8081/health

PostgreSQL host port (optional local tooling): localhost:5433

The API applies the committed EF Core migration on startup and seeds
deterministic demo accounts/data. The first build may take longer
because Docker/NuGet/npm dependencies have to be downloaded.

Demo credentials

RoleEmailPassword

Admin               admin@demo.com                Admin@123
Teacher             teacher@demo.com              Teacher@123
Student             student@demo.com              Student@123
Other Teacher       farhana.yasmin@univ.ac.bd     Teacher@123
Other Student       anika.rahman@student.edu.bd   Student@123

The seed also contains six further faculty accounts (ayman.sadiq@,
zarin.subah@, mahfuz.rahman@, tasnim.ara@, shahriar.hossain@,
nazmul.huda@ --- all @univ.ac.bd) and a full student roster, every
one of them using the same role password above. The "Other Teacher" and
"Other Student" rows are the accounts to use for negative authorization
checks: neither is mapped to teacher@demo.com's class-subject
assignments.

How the frontend talks to the API

The browser only ever calls its own origin at /api/.... That request
is handled by the Next.js route handler in
frontend/app/api/[...path]/route.ts, which forwards it to ASP.NET Core
using the server-side BACKEND_URL. One base URL, one code path ---
nothing about the API's host is baked into the client bundle, so the
same build runs unchanged locally and in Docker.

Local: BACKEND_URL=http://localhost:8081 (the default; no
.env.local needed)

Docker: BACKEND_URL=http://api:8080, set in docker-compose.yml

Architecture

AssignmentManagement.Domain
  Entities + enums; no infrastructure dependency

AssignmentManagement.Application
  DTOs + validators + business rules + service contracts/implementations

AssignmentManagement.Infrastructure
  EF Core DbContext/configurations + PostgreSQL migration/snapshot
  BCrypt password hashing + JWT token implementation + demo seed

AssignmentManagement.Api
  Thin controllers + JWT/Swagger composition + exception/logging middleware

AssignmentManagement.Tests
  xUnit tests for business rules, authorization and submission lifecycle

frontend
  Next.js App Router + React + type-safe TypeScript API contracts

docker-compose.yml
  PostgreSQL + API + frontend + opt-in test runner

Dependency direction is inward: API/Infrastructure depend on
Application/Domain; Domain does not depend on outer layers.

Core Data Model

The source-of-truth relationship is intentionally normalized:

Teacher ─┐
Class ───┼─> TeacherAssignment ─> Assignment ─> Submission ─> SubmissionVersion ─> Attachment
Subject ─┘                              ↑              ↑
                                         StudentEnrollment / Student

Important decisions:

Assignment stores only TeacherAssignmentId rather than
duplicating TeacherId + ClassRoomId + SubjectId.

One (AssignmentId, StudentId) has one Submission lifecycle row.

Every resubmission creates the next immutable SubmissionVersion.

SubmissionAttachment belongs to a specific SubmissionVersion.

IsLate is independent from SubmissionStatus.

GradedByTeacherId is nullable and separate from StudentId.

Core academic/history relationships use restrictive deletes; only
Submission → SubmissionVersion → SubmissionAttachment cascades.

See docs/ERD_AND_RELATIONS.md for the FK/unique-index reference.

Authentication & Authorization

Authentication:

BCrypt password hashing.

JWT issuer, audience, lifetime and signing-key validation.

JWT claims include user id, email, name and role.

Inactive users cannot log in, and JWT validation re-checks that the
account is still active on protected requests.

There is no public registration endpoint where a caller can choose a
privileged role; Admin creates managed users.

Authorization uses two gates:

Controller role gate (Admin, Teacher, Student).

Application-service ownership/business gate using the authenticated
JWT user id.

Examples:

Teacher can create an assignment only from their own active
TeacherAssignment mapping.

Teacher cannot grade another teacher's submission.

Student never supplies StudentId for "my submission" operations;
identity comes from JWT.

Student can see published assignments only for active classroom
enrollments.

Student cannot read/resubmit another student's submission.

The role gate alone is not treated as sufficient. A teacher holding a
valid, unexpired token still receives 403 Forbidden on another
teacher's submission, because ownership is checked separately in the
application service. The UI additionally never renders links to
resources the user does not own, but that is convenience, not a security
control --- the server enforces the rule for direct API calls too.

See docs/SECURITY_DESIGN.md for the security model and
docs/TEST_MATRIX.md for requirement-to-test mapping.

Business Rules

Assignment lifecycle: Draft → Published → Archived; Closed exists as
a domain state for explicit closure scenarios.

Draft assignments are not visible to students.

Deadline must be in the future when an assignment is
created/updated.

Submission after Deadline + GraceMinutes is rejected.

Submission inside the grace window is accepted and records
IsLate = true.

0 <= Marks <= MaxMarks.

Resubmission requires AllowResubmission = true and an open
deadline/grace window.

Resubmitting never overwrites prior work: it creates a new version
and increments CurrentVersion.

If a graded submission is resubmitted, the old version remains in
history but current Marks, Feedback, GradedAt and
GradedByTeacherId are cleared so the new answer is evaluated
again.

DB uniqueness protects duplicate lifecycle/mapping/version records.

Tests

The dedicated xUnit project contains 39 tests across business rules,
authorization, service behaviour and API integration. The highest-risk
requirements are covered directly:

AreaCovered by

Deadline &     StudentCannotSubmitAfterDeadline,
grace window   LateWithinGraceIsAcceptedAndFlagged,
SubmissionAfterGraceWindowIsRejected,
SubmissionBlockedAfterGracePeriod

Marks          MarksCannotExceedMaxMarks
validation

Draft          DraftAssignmentIsNotVisibleToStudent,
visibility     PublishedAssignmentCannotBeEdited

Class-scoped   StudentCannotSeeOtherClassAssignment
access

Teacher        TeacherCannotCreateAssignmentForUnassignedClassSubject,
ownership      TeacherCannotGradeOtherTeachersSubmission,
InactiveTeacherMappingCannotCreateAssignment

Submission     FirstSubmissionCreatesVersionOne,
versioning     ResubmissionCreatesNextVersion,
ResubmissionAfterGradeClearsPreviousGrade,
StudentCannotSubmitTwiceUseResubmitInstead

Timezone       CreateAssignmentConvertsLocalDeadlineOffsetToUtc
safety

Admin user     UpdateUser_DemoteSoleActiveAdmin_ThrowsBusinessRuleException,
management     CreateTeacher_DuplicateEmail_ThrowsConflictException

The frontend has its own Vitest suite (cd frontend && npm run test)
covering the API client, form components and table rendering.

Run tests without installing the .NET SDK locally:

docker compose --profile test run --rm tests

Or, with .NET 8 SDK installed:

dotnet restore AssignmentManagement.sln
dotnet build AssignmentManagement.sln --configuration Release
dotnet test tests/AssignmentManagement.Tests/AssignmentManagement.Tests.csproj --configuration Release

Development Without Running the Full Stack in Docker

Docker is the reproducible evaluation path, not a hard requirement for
coding/debugging.

Start only PostgreSQL:

docker compose up -d postgres

Then run the API from Visual Studio using the AssignmentManagement.Api
startup project. The included local development profile uses:

API: http://localhost:8081

PostgreSQL: localhost:5433

For the frontend:

cd frontend
npm install
npm run dev        # http://localhost:3000
npm run test       # Vitest component and API-client tests
npm run lint       # ESLint (next/core-web-vitals)

If the Docker frontend container is already running, stop it first
(docker compose stop frontend) or the dev server will fall back to
port 3001 because port 3000 is taken.

No .env.local file is required. BACKEND_URL defaults to
http://localhost:8081; create .env.local from .env.local.example
only if your API runs somewhere else.

appsettings.Development.json is committed on purpose. It contains only
a localhost connection string and a throwaway JWT signing key so that
the repository can be cloned and run immediately, with no hand-written
configuration step. No production credential is in the repository; real
deployments override every value through environment variables, as
docker-compose.yml already demonstrates.

Common Docker Commands

# start or rebuild the complete stack
docker compose up --build -d

# inspect status
docker compose ps

# follow API logs
docker compose logs -f api

# follow frontend logs
docker compose logs -f frontend

# stop while preserving PostgreSQL data
docker compose down

# delete PostgreSQL volume and reseed from a clean database
docker compose down -v
docker compose up --build -d

# run tests
docker compose --profile test run --rm tests

Note on demo deadlines. The seeder computes deadlines relative to
DateTime.UtcNow at seed time, so a freshly seeded database always has
one assignment inside its grace window and one closed. The seeder is
idempotent, which means restarting containers does not refresh those
dates. If the demo data looks stale --- for example the grace-window
assignment now rejects submissions --- run docker compose down -v and
start again to reseed from an empty database.

2--3 Minute Evaluator Walkthrough

Open the landing page and use the Admin demo account.

Show users, classrooms, subjects, enrollment and teacher mapping.

Login as Teacher; create a draft using only the mapped class/subject
and publish it.

Login as Student; show deadline/grace state and submit version 1.

Login as Teacher; open submissions, show visible Max Marks, then
grade with feedback.

Login as Student; show marks, feedback and version history.

Optional: resubmit before the window closes and show that history is
preserved while the current grade is cleared for re-evaluation.

Demonstrate a role/ownership denial (403) with the "Other Teacher"
account (farhana.yasmin@univ.ac.bd). Her dashboard shows no
assignments from teacher@demo.com, so use Swagger to call
PUT /api/teacher/submissions/{id}/grade with a submission id
belonging to Prof. Rahat Chowdhury: the API returns 403 Forbidden
with "You cannot manage another teacher's submission."

Frontend UX

The UI uses a restrained registrar-ledger visual system rather than a
generic dashboard template:

indigo ink for structure

manila/ochre accent for academic context

seal green for positive/published/graded states

vermilion only for late/error/danger states

status spines on records

deadline meter and explicit deadline/grace text

loading skeletons

Retry error states

empty states

responsive sidebar/tables

inline submit/grade/return forms (no browser prompt() workflow)

type-safe API response models rather than any[]

The landing page pairs a CSS isometric desk scene with four
hand-authored SVG illustrations (frontend/public/illustrations/)
showing the classroom, the teacher, the student and the administrator.
They are drawn in the same palette as the application, total roughly 15
KB, and require no external image host, icon pack or web font.
Typography uses the platform UI stack deliberately --- there is no
network font request anywhere in the build.

Assumptions

One user has one fixed role (Admin, Teacher or Student) for this
recruitment scope.

Admin owns master-data setup and account creation.

Teacher-to-class-to-subject authority is represented by one
TeacherAssignment mapping.

Students may have multiple active classroom enrollments, though the
demo seed is intentionally small.

DateTime values are stored/handled as UTC by the API; the browser
renders them in the user's local timezone.

Text answer submission is the required MVP path. The attachment
schema is ready, but binary upload/storage is intentionally not
exposed as an endpoint.

A grace window is a controlled tolerance after the main deadline; it
never hides lateness because IsLate remains explicit.

There is no background scheduler required to close assignments;
submission eligibility is enforced from status + deadline + grace on
every write.

Known Limitations / Deliberate Scope Choices

No optimistic concurrency token on Submission. If a
student resubmits while a teacher has a grading form open, the grade
can be written against a newer version than the one that was
evaluated. A PostgreSQL xmin row-version mapped with
IsRowVersion(), plus a 409 Conflict response, is the planned
fix. This is the most significant known gap.

List endpoints return complete result sets. Only
AuditQueryService applies Skip/Take server-side; pagination
and filtering on the remaining admin lists are done in the UI after
the full payload arrives. That is acceptable at demo scale and would
move into the API --- via a shared PagedResult<T> and
PageRequest(Page, PageSize) --- before production.

API integration test coverage is narrow.
ApiControllerIntegrationTests exercises three admin creation
routes end-to-end. The authorization paths are covered thoroughly at
the service layer but not across the HTTP boundary; adding
Grade_AsNonOwningTeacher_Returns403 and
Grade_AsStudent_Returns403 is the next testing task.

Demo data is seeded on every startup, including outside
Development. For an evaluation build that is intentional so the
reviewer needs no setup step; in a real deployment it belongs behind
an environment check or configuration flag.

Swagger is enabled in all environments because the API contract
is part of this deliverable. It would be gated or authenticated in
production.

No refresh-token flow, notification/email service, or
multi-institution hierarchy.

No binary attachment upload endpoint in the MVP even though the data
model supports version-owned attachment metadata.

Demo secrets/defaults are explicitly local-only and must be replaced
for deployment.

The JWT is stored in localStorage on the client. An httpOnly
cookie set by the existing Next.js proxy route would be stronger
against XSS; because every request already flows through one api()
wrapper and one proxy handler, that change is localised to two
files.

These are scope decisions, not authorization bypasses; core workflow
rules remain server-enforced.

Migration & Database Safety

Infrastructure/Persistence/Migrations contains:

202608110001_InitialCreate --- the complete PostgreSQL schema

AppDbContextModelSnapshot.cs

The API applies migrations on startup with MigrateAsync() and then
seeds demo data. There is no raw DDL patching at startup: the schema
comes from the migration and only from the migration, so a fresh
database and an existing database follow the exact same code path.

The model also enforces important DB constraints/indexes (unique
email/class/subject codes, enrollment/mapping/submission/version
uniqueness, valid marks/version numbers/status values).

CI

GitHub Actions builds the solution and runs backend tests. A separate
frontend job performs dependency installation and a production Next.js
build. Both jobs must pass on main.

The frontend image installs dependencies with npm ci against the
committed package-lock.json, so the container build resolves exactly
the same dependency tree as local development and CI.

Submission Checklist

Before handing the repository/ZIP to an evaluator, run from a fresh
database:

docker compose down -v
docker compose up --build -d
docker compose ps
docker compose --profile test run --rm tests

Then verify:

http://localhost:8081/health returns 200 OK.

All 39 backend tests pass.

Admin / Teacher / Student login succeeds.

Teacher creates + publishes an assignment.

Student submits inside the grace window and the record shows Late.

Student resubmits; version history is preserved and the previous
grade is cleared.

Teacher grades with marks and feedback.

Student sees marks, feedback and both versions.

Student → Admin endpoint is denied.

Other teacher (farhana.yasmin@univ.ac.bd) → teacher@demo.com's
submission is denied with 403.

Design Decision Notes

Short interview-ready explanations are in docs/DESIGN_DECISIONS.md.
The key principle is that every "advanced" feature exists to protect
data integrity, authorization, auditability or evaluator usability ---
not to add unnecessary architecture.
