# Assignment & Submission Management System

A recruitment-focused full-stack school/college assignment workflow built with **ASP.NET Core 8 Web API, C#, EF Core 8, PostgreSQL, JWT/BCrypt, Next.js + React + TypeScript, xUnit, Swagger and Docker Compose**.

The project is deliberately scoped around one complete business flow: **Admin configures the academic structure → Teacher creates/publishes assignments → Student submits/resubmits → Teacher grades/returns work → Student sees marks and feedback**.

> Every change made in this revision, and the reason for it, is listed in
> [`docs/CHANGES_APPLIED.md`](docs/CHANGES_APPLIED.md).

## Quick Start — Docker (recommended for evaluation)

Prerequisite: Docker Desktop / Docker Engine with Compose support.

```bash
docker compose up --build -d
docker compose ps
```

Open:

- Frontend: `http://localhost:3000`
- Swagger: `http://localhost:8081/swagger`
- Health: `http://localhost:8081/health`
- PostgreSQL host port (optional local tooling): `localhost:5433`

The API applies the committed EF Core migration on startup and seeds deterministic demo accounts/data. The first build may take longer because Docker/NuGet/npm dependencies have to be downloaded.

### Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `Admin@123` |
| Teacher | `teacher@demo.com` | `Teacher@123` |
| Student | `student@demo.com` | `Student@123` |
| Other Teacher | `teacher2@demo.com` | `Teacher2@123` |
| Other Student | `student2@demo.com` | `Student2@123` |

The second Teacher/Student accounts exist for negative authorization checks.

## How the frontend talks to the API

The browser only ever calls its own origin at `/api/...`. That request is handled by the Next.js
route handler in `frontend/app/api/[...path]/route.ts`, which forwards it to ASP.NET Core using the
server-side `BACKEND_URL`. One base URL, one code path — nothing about the API's host is baked into
the client bundle, so the same build runs unchanged locally and in Docker.

- Local: `BACKEND_URL=http://localhost:8081` (the default; no `.env.local` needed)
- Docker: `BACKEND_URL=http://api:8080`, set in `docker-compose.yml`

## Architecture

```text
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
```

Dependency direction is inward: API/Infrastructure depend on Application/Domain; Domain does not depend on outer layers.

## Core Data Model

The source-of-truth relationship is intentionally normalized:

```text
Teacher ─┐
Class ───┼─> TeacherAssignment ─> Assignment ─> Submission ─> SubmissionVersion ─> Attachment
Subject ─┘                              ↑              ↑
                                         StudentEnrollment / Student
```

Important decisions:

- `Assignment` stores **only `TeacherAssignmentId`** rather than duplicating `TeacherId + ClassRoomId + SubjectId`.
- One `(AssignmentId, StudentId)` has one `Submission` lifecycle row.
- Every resubmission creates the next immutable `SubmissionVersion`.
- `SubmissionAttachment` belongs to a specific `SubmissionVersion`.
- `IsLate` is independent from `SubmissionStatus`.
- `GradedByTeacherId` is nullable and separate from `StudentId`.
- Core academic/history relationships use restrictive deletes; only `Submission → SubmissionVersion → SubmissionAttachment` cascades.

See `docs/ERD_AND_RELATIONS.md` for the FK/unique-index reference.

## Authentication & Authorization

Authentication:

- BCrypt password hashing.
- JWT issuer, audience, lifetime and signing-key validation.
- JWT claims include user id, email, name and role.
- Inactive users cannot log in, and JWT validation re-checks that the account is still active on protected requests.
- There is no public registration endpoint where a caller can choose a privileged role; Admin creates managed users.

Authorization uses **two gates**:

1. Controller role gate (`Admin`, `Teacher`, `Student`).
2. Application-service ownership/business gate using the authenticated JWT user id.

Examples:

- Teacher can create an assignment only from their own active `TeacherAssignment` mapping.
- Teacher cannot grade another teacher's submission.
- Student never supplies `StudentId` for “my submission” operations; identity comes from JWT.
- Student can see published assignments only for active classroom enrollments.
- Student cannot read/resubmit another student's submission.

See `docs/SECURITY_DESIGN.md` for the security model and `docs/TEST_MATRIX.md` for requirement-to-test mapping.

## Business Rules

- Assignment lifecycle: `Draft → Published → Archived`; `Closed` exists as a domain state for explicit closure scenarios.
- Draft assignments are not visible to students.
- `Deadline` must be in the future when an assignment is created/updated.
- Submission after `Deadline + GraceMinutes` is rejected.
- Submission inside the grace window is accepted and records `IsLate = true`.
- `0 <= Marks <= MaxMarks`.
- Resubmission requires `AllowResubmission = true` and an open deadline/grace window.
- Resubmitting never overwrites prior work: it creates a new version and increments `CurrentVersion`.
- If a graded submission is resubmitted, the old version remains in history but current `Marks`, `Feedback`, `GradedAt` and `GradedByTeacherId` are cleared so the new answer is evaluated again.
- DB uniqueness protects duplicate lifecycle/mapping/version records.

## Tests

The dedicated xUnit project contains **39 tests** across business rules, authorization, service
behaviour and API integration. The highest-risk requirements are covered directly:

| Area | Covered by |
|---|---|
| Deadline & grace window | `StudentCannotSubmitAfterDeadline`, `LateWithinGraceIsAcceptedAndFlagged`, `SubmissionAfterGraceWindowIsRejected`, `SubmissionBlockedAfterGracePeriod` |
| Marks validation | `MarksCannotExceedMaxMarks` |
| Draft visibility | `DraftAssignmentIsNotVisibleToStudent`, `PublishedAssignmentCannotBeEdited` |
| Class-scoped access | `StudentCannotSeeOtherClassAssignment` |
| Teacher ownership | `TeacherCannotCreateAssignmentForUnassignedClassSubject`, `TeacherCannotGradeOtherTeachersSubmission`, `InactiveTeacherMappingCannotCreateAssignment` |
| Submission versioning | `FirstSubmissionCreatesVersionOne`, `ResubmissionCreatesNextVersion`, `ResubmissionAfterGradeClearsPreviousGrade`, `StudentCannotSubmitTwiceUseResubmitInstead` |
| Timezone safety | `CreateAssignmentConvertsLocalDeadlineOffsetToUtc` |
| Admin user management | `UpdateUser_DemoteSoleActiveAdmin_ThrowsBusinessRuleException`, `CreateTeacher_DuplicateEmail_ThrowsConflictException` |
| API + auth end-to-end | `ApiControllerIntegrationTests` (in-memory host, real JWT, real routing) |

The frontend has its own Vitest suite (`cd frontend && npm run test`) covering the API client,
form components and table rendering.

Run tests without installing the .NET SDK locally:

```bash
docker compose --profile test run --rm tests
```

Or, with .NET 8 SDK installed:

```bash
dotnet restore AssignmentManagement.sln
dotnet build AssignmentManagement.sln --configuration Release
dotnet test tests/AssignmentManagement.Tests/AssignmentManagement.Tests.csproj --configuration Release
```

## Development Without Running the Full Stack in Docker

Docker is the reproducible evaluation path, not a hard requirement for coding/debugging.

Start only PostgreSQL:

```bash
docker compose up -d postgres
```

Then run the API from Visual Studio using the `AssignmentManagement.Api` startup project. The included local development profile uses:

- API: `http://localhost:8081`
- PostgreSQL: `localhost:5433`

For the frontend:

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm run test       # Vitest component and API-client tests
npm run lint       # ESLint (next/core-web-vitals)
```

No `.env.local` file is required. `BACKEND_URL` defaults to `http://localhost:8081`; create
`.env.local` from `.env.local.example` only if your API runs somewhere else.

> `appsettings.Development.json` **is committed on purpose**. It contains only a localhost
> connection string and a throwaway JWT signing key so that the repository can be cloned and run
> immediately, with no hand-written configuration step. No production credential is in the
> repository; real deployments override every value through environment variables, as
> `docker-compose.yml` already demonstrates.

## Common Docker Commands

```bash
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
```

## 2–3 Minute Evaluator Walkthrough

1. Open the landing page and use the Admin demo account.
2. Show users, classrooms, subjects, enrollment and teacher mapping.
3. Login as Teacher; create a draft using only the mapped class/subject and publish it.
4. Login as Student; show deadline/grace state and submit version 1.
5. Login as Teacher; open submissions, show visible Max Marks, then grade with feedback.
6. Login as Student; show marks, feedback and version history.
7. Optional: resubmit before the window closes and show that history is preserved while the current grade is cleared for re-evaluation.
8. In Swagger, demonstrate a role/ownership denial (403) using the second demo Teacher/Student account.

## Frontend UX

The UI uses a restrained **registrar-ledger** visual system rather than a generic dashboard template:

- indigo ink for structure
- manila/ochre accent for academic context
- seal green for positive/published/graded states
- vermilion only for late/error/danger states
- status spines on records
- deadline meter and explicit deadline/grace text
- loading skeletons
- Retry error states
- empty states
- responsive sidebar/tables
- inline submit/grade/return forms (no browser `prompt()` workflow)
- type-safe API response models rather than `any[]`

The landing page pairs a CSS isometric desk scene with four hand-authored SVG illustrations
(`frontend/public/illustrations/`) showing the classroom, the teacher, the student and the
administrator. They are drawn in the same palette as the application, total roughly 15 KB, and
require no external image host, icon pack or web font. Typography uses the platform UI stack
deliberately — there is no network font request anywhere in the build.

## Assumptions

- One user has one fixed role (`Admin`, `Teacher` or `Student`) for this recruitment scope.
- Admin owns master-data setup and account creation.
- Teacher-to-class-to-subject authority is represented by one `TeacherAssignment` mapping.
- Students may have multiple active classroom enrollments, though the demo seed is intentionally small.
- `DateTime` values are stored/handled as UTC by the API; the browser renders them in the user's local timezone.
- Text answer submission is the required MVP path. The attachment schema is ready, but binary upload/storage is intentionally not exposed as an endpoint.
- A grace window is a controlled tolerance after the main deadline; it never hides lateness because `IsLate` remains explicit.
- There is no background scheduler required to close assignments; submission eligibility is enforced from status + deadline + grace on every write.

## Known Limitations / Deliberate Scope Choices

- No refresh-token flow, notification/email service, or multi-institution hierarchy.
- No binary attachment upload endpoint in the MVP even though the data model supports version-owned attachment metadata.
- Pagination and filtering are client-side on the admin lists; production scale would move both into the API.
- Demo secrets/defaults are explicitly local-only and must be replaced for deployment.

These are scope decisions, not authorization bypasses; core workflow rules remain server-enforced.

## Migration & Database Safety

`Infrastructure/Persistence/Migrations` contains:

- `202608110001_InitialCreate` — the complete PostgreSQL schema
- `AppDbContextModelSnapshot.cs`

The API applies migrations on startup with `MigrateAsync()` and then seeds demo data. There is no
raw DDL patching at startup: the schema comes from the migration and only from the migration, so a
fresh database and an existing database follow the exact same code path.

The model also enforces important DB constraints/indexes (unique email/class/subject codes, enrollment/mapping/submission/version uniqueness, valid marks/version numbers/status values).

## CI

GitHub Actions builds the solution and runs backend tests. A separate frontend job performs dependency installation and a production Next.js build.

## Submission Checklist

Before handing the repository/ZIP to an evaluator, run from a fresh database:

```bash
docker compose down -v
docker compose up --build -d
docker compose ps
docker compose --profile test run --rm tests
```

Then verify:

- `http://localhost:8081/health` returns `200 OK`.
- Admin / Teacher / Student login succeeds.
- Teacher creates + publishes an assignment.
- Student submits.
- Teacher grades.
- Student sees marks/feedback.
- Student → Admin endpoint is denied.
- Other teacher → first teacher's submission is denied.

## Design Decision Notes

Short interview-ready explanations are in `docs/DESIGN_DECISIONS.md`. The key principle is that every “advanced” feature exists to protect data integrity, authorization, auditability or evaluator usability—not to add unnecessary architecture.
