import React, { FormEvent } from 'react';
import StatusChip from '../StatusChip';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import { EmptyState, LoadingState } from '../States';
import type { AssignmentResponse, SubmissionResponse } from '@/lib/types';

interface SubmissionReviewPanelProps {
  selectedAssignment: AssignmentResponse | null;
  submissions: SubmissionResponse[];
  loading: boolean;
  onGrade: (event: FormEvent<HTMLFormElement>, submission: SubmissionResponse) => Promise<void>;
  onReturn: (event: FormEvent<HTMLFormElement>, submissionId: string) => Promise<void>;
  savingActionId: string | null;
}

export default function SubmissionReviewPanel({
  selectedAssignment,
  submissions,
  loading,
  onGrade,
  onReturn,
  savingActionId,
}: SubmissionReviewPanelProps) {
  if (!selectedAssignment) {
    return (
      <EmptyState
        title="Select an assignment to grade"
        message="Click “View submissions” on any published assignment card above to review student work."
      />
    );
  }

  if (loading) {
    return <LoadingState cards={2} />;
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions received"
        message={`No student has submitted work for "${selectedAssignment.title}" yet.`}
      />
    );
  }

  return (
    <div className="submission-review-list">
      {submissions.map((submission) => (
        <article
          className={`submission-review-card status-spine spine-${submission.isLate ? 'red' : 'green'}`}
          key={submission.id}
        >
          <div className="record-card-header">
            <div>
              <p className="record-context">Student Submission</p>
              <h3>{submission.studentName}</h3>
            </div>
            <div className="chip-row">
              <StatusChip label={submission.status} />
              {submission.isLate && <StatusChip label="Late" tone="late" />}
            </div>
          </div>

          <div className="submission-answer">
            <span>Latest Submitted Answer • Version {submission.currentVersion}</span>
            <p>
              {submission.versions.at(-1)?.answerText ||
                'No text answer provided.'}
            </p>
          </div>

          <div className="grade-limit-banner">
            <span>Maximum Grade Allowed</span>
            <strong>{submission.maxMarks} marks</strong>
            <small>Backend enforces limit: 0 ≤ Marks ≤ {submission.maxMarks}</small>
          </div>

          <div className="grading-grid">
            <form
              className="grade-form"
              onSubmit={(event) => void onGrade(event, submission)}
            >
              <h4>Grade submission</h4>

              <FormField
                id={`marks-${submission.id}`}
                label={`Marks (Max ${submission.maxMarks})`}
                required
                hint={`Enter score between 0 and ${submission.maxMarks}`}
              >
                <input
                  id={`marks-${submission.id}`}
                  className="field-control code-input"
                  name="marks"
                  type="number"
                  min="0"
                  max={submission.maxMarks}
                  step="0.01"
                  defaultValue={submission.marks ?? ''}
                  placeholder={`0 to ${submission.maxMarks}`}
                  required
                />
              </FormField>

              <FormField
                id={`feedback-${submission.id}`}
                label="Feedback"
                hint="Constructive comments for student"
              >
                <textarea
                  id={`feedback-${submission.id}`}
                  className="field-control textarea-control compact-textarea"
                  name="feedback"
                  defaultValue={submission.feedback ?? ''}
                  placeholder="Great work on..."
                />
              </FormField>

              <SubmitButton
                loading={savingActionId === `grade-${submission.id}`}
                loadingText="Saving grade..."
              >
                Save grade
              </SubmitButton>
            </form>

            <form
              className="grade-form return-form"
              onSubmit={(event) => void onReturn(event, submission.id)}
            >
              <h4>Return for revision</h4>

              <FormField
                id={`returnFeedback-${submission.id}`}
                label="Required Revision Instructions"
                required
                hint="Explain what the student must revise before resubmitting"
              >
                <textarea
                  id={`returnFeedback-${submission.id}`}
                  className="field-control textarea-control compact-textarea"
                  name="returnFeedback"
                  placeholder="Please revise section 2..."
                  required
                />
              </FormField>

              <SubmitButton
                variant="outline"
                loading={savingActionId === `return-${submission.id}`}
                loadingText="Returning..."
              >
                Return submission
              </SubmitButton>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
