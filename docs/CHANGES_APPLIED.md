# Changes applied in this revision

A record of what was changed and why, so the reasoning is available during the technical
interview rather than having to be reconstructed from a diff.

## Correctness

| Change | Reason |
|---|---|
| Deleted `202608120002_AddSubjectClassRoomId.cs` | It had no `[Migration]` attribute or designer file, so EF Core never discovered it. Its column, index and foreign key were already created by `InitialCreate` — running it would have failed with *column already exists* on a fresh database. |
| Removed the `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` block from `Program.cs` | Raw DDL patching at startup, wrapped in an empty `catch`, hid schema drift instead of fixing it. The schema now comes from the migration and only from the migration. |
| `AssignmentService.NormalizeToUtc()` | The deadline was compared to `DateTime.UtcNow` *before* being converted to UTC. A payload with a local offset or an unspecified kind could therefore pass or fail validation depending on the server's timezone. Every deadline is now normalised to a single UTC instant before any comparison or persistence. |
| `SubmissionService.ResubmitAsync` re-checks enrollment and mapping state | Only the first submission verified eligibility. A student unenrolled after submitting could still add versions. Eligibility is now enforced on every write, matching `SubmitAsync`. |
| Removed the duplicate `db.SubmissionVersions.Add(version)` | The aggregate is tracked, so adding to the navigation collection is sufficient. The second call was redundant and the comment above it was misleading. |
| `next.config.mjs` sets `output: 'standalone'` | The Dockerfile copies `.next/standalone`. Without this option that directory is never produced and the frontend image build fails. |

## API surface

| Change | Reason |
|---|---|
| Removed the second `[Route("admin/users")]` / `admin/students` / `admin/teachers` attributes | Each controller now has exactly one canonical route under `/api`. The duplicates existed only to satisfy the old client-side URL fallback, and they produced duplicate Swagger entries. |
| Swagger is enabled in every environment | The API contract is part of the deliverable, not a development-only convenience. |

## Frontend

| Change | Reason |
|---|---|
| `lib/api.ts` rewritten around a single base URL | The previous client tried a list of candidate URLs in a loop. That replayed non-idempotent `POST` requests against several hosts when the first returned 404 or 500, hardcoded `localhost:8081` into the bundle, and hid real 404s behind misleading errors. All browser traffic now goes to `/api`, proxied server-side by `app/api/[...path]/route.ts` using `BACKEND_URL`. |
| A failed login no longer clears the session | Any 401 previously triggered `logout()`, which navigated to `/login` and destroyed the error message before it could render — so a wrong password looked like the page had simply blinked. `/auth/login` is now excluded from session teardown, and there is a regression test for it. |
| Removed the duplicate `/api/:path*` rewrite from `next.config.mjs` | The route handler and the rewrite did the same job; route handlers take precedence, so the rewrite was dead configuration. |
| `AdminTab` union type plus an `isAdminTab` type guard | Replaced the two `any` casts. `strict` mode is on and should not be undercut. |
| `tsconfig.json`: `target` `es5` → `ES2017`, removed deprecated `baseUrl` | `es5` is well below what Next 15 and React 19 target. |
| Deleted `tailwind.config.ts` | Tailwind was never installed — no dependency, no PostCSS config, no directives in the stylesheet. The orphan config implied a tooling choice that did not exist. |
| Added `.eslintrc.json`, `npm run lint`, and lint + tests in CI | The role explicitly asks for coding standards and code review practices. |

## Design

| Change | Reason |
|---|---|
| Landing top block rebuilt to the approved mockup | Floating top bar, hero with a hand-drawn gold underline, three floating notification cards over a laptop-and-folder scene, technology strip, four pillar cards joined by a dashed connector, and a capability strip. Everything from the classroom band downward is unchanged. |
| Stack marks drawn as inline SVG rather than vendor logo files | The technology strip needs recognisable marks; shipping third-party trademark files in a recruitment repository does not. Each mark is drawn in this project's own code. |
| Four SVG illustrations in `public/illustrations/` | The landing page now shows the classroom, teacher, student and administrator, drawn in the existing navy / gold / cream palette. Roughly 15 KB total, no external image host or icon pack. |
| New landing sections: classroom band, illustrated role cards, register strip, closing band | The page now explains the product before it explains the stack. |
| `app/icon.svg` | There was no favicon; the browser tab showed the framework default next to CampusFlow branding. |
| Removed `Inter` from the font stack | It was declared but never loaded, so the page silently fell back to the platform UI font anyway. The stack now states what actually renders. |
| Global `:focus-visible` outline and a skip link | Keyboard navigation previously had no visible focus indicator anywhere. |
| `prefers-reduced-motion` guard | Skeletons and transitions now respect the system setting. |
| Sticky table headers, row hover, horizontal scroll with an edge fade under 640 px | Wide admin tables were unusable on a narrow viewport. |

## Roster tables

`StudentsTable.tsx` and `TeachersTable.tsx` were written entirely in Tailwind utility classes
(`w-3 h-3`, `flex items-center gap-3`, `divide-y`, `bg-gradient-to-br`) in a project that never had
Tailwind installed — no dependency, no PostCSS step, no directives in the stylesheet. None of those
classes resolved to anything, which had two visible effects:

- the inline SVG icons had no width or height, so each one expanded to fill its table cell
- the flex layouts never applied, so name, email, role and status stacked vertically instead of
  sitting on one row

Both components are rewritten against this project's own class vocabulary (`responsive-table`,
`panel-card`, plus a new `roster-table` block in `globals.css`), and the wrapper's `table-responsive`
class — which did not exist in the stylesheet — is corrected to `responsive-table`. Two regression
tests were added: one asserting that a teacher's name, email, role, status and action button all
render inside a single `<tr>`, and one asserting that no `<svg>` in the table body is left unsized.

## Repository hygiene

| Change | Reason |
|---|---|
| `appsettings.Development.json` is committed and the ignore rule is documented | It held the only connection string and JWT key. Ignoring it meant a fresh clone crashed on startup with *DefaultConnection is missing* — exactly the path the README tells an evaluator to take. The file contains only localhost placeholders. |
| `.env.local` is no longer required | `BACKEND_URL` defaults to `http://localhost:8081` and the browser base URL defaults to `/api`, so the frontend runs from a clean clone with no configuration step. |
| Regenerated `PROJECT_STRUCTURE.txt` | It was missing four controllers. |
| Corrected the test count and the pagination note in the README | Both were inaccurate. |
