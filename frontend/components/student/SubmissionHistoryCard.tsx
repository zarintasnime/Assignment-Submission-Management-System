import React from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import { formatDateTime } from '@/lib/format';
import type { AssignmentResponse, SubmissionResponse } from '@/lib/types';
import type { WindowState } from './AssignmentCard';

interface SubmissionHistoryCardProps {
  submission: SubmissionResponse;
  assignment?: AssignmentResponse;
  getWindowState: (assignment: AssignmentResponse) => WindowState;
  onOpenResubmitModal: (submission: SubmissionResponse) => void;
}

export default function SubmissionHistoryCard({
  submission,
  assignment,
  getWindowState,
  onOpenResubmitModal,
}: SubmissionHistoryCardProps) {
  const canResubmit = assignment
    ? assignment.status === 'Published' &&
      assignment.allowResubmission &&
      getWindowState(assignment).canSubmit
    : false;

  return (
    <article
      className={`submission-history-card status-spine spine-${
        submission.marks !== null ? 'green' : submission.isLate ? 'red' : 'ochre'
      }`}
    >
      <div className="record-card-header">
        <div>
          <p className="record-context">Submission Lifecycle</p>
          <h3>{submission.assignmentTitle}</h3>
        </div>
        <div className="chip-row">
          <StatusChip label={submission.status} />
          {submission.isLate && <StatusChip label="Late" tone="late" />}
        </div>
      </div>

      <div className="submission-score-row">
        <div>
          <span>Current version</span>
          <strong>v{submission.currentVersion}</strong>
        </div>
        <div>
          <span>Marks</span>
          <strong>
            {submission.marks === null
              ? 'Pending Review'
              : `${submission.marks} / ${submission.maxMarks}`}
          </strong>
        </div>
        <div>
          <span>Last submitted</span>
          <strong className="code-text">{formatDateTime(submission.lastSubmittedAt)}</strong>
        </div>
      </div>

      {submission.feedback && (
        <div className="feedback-box">
          <span>Teacher Feedback</span>
          <p>{submission.feedback}</p>
        </div>
      )}

      <details className="version-details">
        <summary>Version History ({submission.versions.length})</summary>
        <div className="version-list">
          {submission.versions.map((version) => (
            <div className="version-entry" key={version.versionNo}>
              <div>
                <strong>Version {version.versionNo}</strong>
                <span>{formatDateTime(version.submittedAt)}</span>
              </div>
              <p>{version.answerText || 'No answer text.'}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="record-actions">
        {canResubmit ? (
          <SubmitButton
            variant="outline"
            onClick={() => onOpenResubmitModal(submission)}
            type="button"
          >
            Submit Version {submission.currentVersion + 1}
          </SubmitButton>
        ) : (
          <span className="muted small-text">Resubmission is currently closed for this work.</span>
        )}
      </div>
    </article>
  );
}
