# Test Matrix

| Requirement / Risk | Test |
|---|---|
| Deadline enforcement | `StudentCannotSubmitAfterDeadline` |
| Grace-window acceptance | `LateWithinGraceIsAcceptedAndFlagged` |
| Grace-window hard stop | `SubmissionAfterGraceWindowIsRejected` |
| Max marks invariant | `MarksCannotExceedMaxMarks` |
| Draft confidentiality | `DraftAssignmentIsNotVisibleToStudent` |
| Enrollment ownership | `StudentCannotSeeOtherClassAssignment` |
| Teacher mapping ownership | `TeacherCannotCreateAssignmentForUnassignedClassSubject` |
| Inactive teaching context | `InactiveTeacherMappingCannotCreateAssignment` |
| First submission version | `FirstSubmissionCreatesVersionOne` |
| Immutable resubmission history | `ResubmissionCreatesNextVersion` |
| Grade invalidation on new version | `ResubmissionAfterGradeClearsPreviousGrade` |
| Cross-teacher authorization | `TeacherCannotGradeOtherTeachersSubmission` |

The tests intentionally prioritize business/security invariants over superficial controller-line coverage.
