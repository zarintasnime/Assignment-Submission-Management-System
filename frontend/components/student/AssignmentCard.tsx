import React from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import { assignmentTone, formatDateTime } from '@/lib/format';
import type { AssignmentResponse } from '@/lib/types';

export type WindowState = {
  label: string;
  tone: 'safe' | 'soon' | 'late';
  percent: number;
  canSubmit: boolean;
};

interface AssignmentCardProps {
  assignment: AssignmentResponse;
  windowState: WindowState;
  alreadySubmitted: boolean;
  onOpenSubmitModal: (assignment: AssignmentResponse) => void;
}

export default function AssignmentCard({
  assignment,
  windowState,
  alreadySubmitted,
  onOpenSubmitModal,
}: AssignmentCardProps) {
  return (
    <article
      className={`record-card status-spine spine-${assignmentSpine(assignment, windowState)}`}
    >
      <div className="record-card-header">
        <div>
          <p className="record-context">
            {assignment.classRoom} / {assignment.subject}
          </p>
          <h3>{assignment.title}</h3>
        </div>
        <StatusChip
          label={assignment.status}
          tone={assignmentTone(assignment.status)}
        />
      </div>

      <p className="record-description">{assignment.description}</p>

      <div className="record-meta-grid">
        <div>
          <span>Deadline</span>
          <strong className="code-text">{formatDateTime(assignment.deadline)}</strong>
        </div>
        <div>
          <span>Max marks</span>
          <strong className="code-text">{assignment.maxMarks}</strong>
        </div>
        <div>
          <span>Grace</span>
          <strong className="code-text">{assignment.graceMinutes} min</strong>
        </div>
      </div>

      <div className={`deadline-meter meter-${windowState.tone}`}>
        <span style={{ width: `${windowState.percent}%` }} />
      </div>
      <p className={`deadline-label deadline-${windowState.tone}`}>
        {windowState.label}
      </p>

      {alreadySubmitted ? (
        <div className="inline-note inline-note-success">
          Already submitted — see submission history below to view status or resubmit.
        </div>
      ) : windowState.canSubmit && assignment.status === 'Published' ? (
        <div className="record-actions">
          <SubmitButton
            onClick={() => onOpenSubmitModal(assignment)}
            type="button"
          >
            Submit Version 1
          </SubmitButton>
        </div>
      ) : (
        <div className="inline-note inline-note-danger">
          Submission is closed for this assignment.
        </div>
      )}
    </article>
  );
}

function assignmentSpine(
  assignment: AssignmentResponse,
  windowState: WindowState,
): 'green' | 'ochre' | 'red' | 'ink' {
  if (assignment.status === 'Closed' || !windowState.canSubmit) return 'red';
  if (windowState.tone === 'soon' || windowState.tone === 'late') return 'ochre';
  if (assignment.status === 'Published') return 'green';
  return 'ink';
}
