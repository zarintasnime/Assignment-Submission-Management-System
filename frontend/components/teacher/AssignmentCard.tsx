import React, { useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import { assignmentTone, formatDateTime, timeRemaining } from '@/lib/format';
import type { AssignmentResponse } from '@/lib/types';

interface AssignmentCardProps {
  assignment: AssignmentResponse;
  onEdit: (assignment: AssignmentResponse) => void;
  onAction: (
    path: string,
    method: 'POST' | 'DELETE',
    message: string,
    actionId: string,
  ) => Promise<void>;
  onViewSubmissions: (assignmentId: string) => void;
  savingActionId: string | null;
}

export default function AssignmentCard({
  assignment,
  onEdit,
  onAction,
  onViewSubmissions,
  savingActionId,
}: AssignmentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deadlineState = timeRemaining(assignment.deadline);

  return (
    <article
      className={`record-card status-spine spine-${statusSpine(assignment.status)}`}
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

      <div className={`deadline-meter meter-${deadlineState.tone}`}>
        <span style={{ width: `${deadlineState.percent}%` }} />
      </div>
      <p className={`deadline-label deadline-${deadlineState.tone}`}>
        {deadlineState.label}
      </p>

      <div className="record-actions">
        {assignment.status === 'Draft' && (
          <>
            <SubmitButton
              size="small"
              loading={savingActionId === `publish-${assignment.id}`}
              onClick={() =>
                void onAction(
                  `/teacher/assignments/${assignment.id}/publish`,
                  'POST',
                  'Assignment published to students.',
                  `publish-${assignment.id}`,
                )
              }
              type="button"
            >
              Publish
            </SubmitButton>

            <button
              className="btn btn-outline btn-small"
              onClick={() => onEdit(assignment)}
              type="button"
            >
              Edit draft
            </button>

            <SubmitButton
              size="small"
              variant="danger-outline"
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
            >
              Delete draft
            </SubmitButton>
          </>
        )}

        {assignment.status !== 'Draft' && assignment.status !== 'Archived' && (
          <SubmitButton
            size="small"
            variant="outline"
            loading={savingActionId === `archive-${assignment.id}`}
            onClick={() =>
              void onAction(
                `/teacher/assignments/${assignment.id}/archive`,
                'POST',
                'Assignment archived.',
                `archive-${assignment.id}`,
              )
            }
            type="button"
          >
            Archive
          </SubmitButton>
        )}

        <button
          className="btn btn-quiet btn-small"
          onClick={() => onViewSubmissions(assignment.id)}
          type="button"
        >
          View submissions
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setShowDeleteConfirm(false);
            await onAction(
              `/teacher/assignments/${assignment.id}`,
              'DELETE',
              'Draft assignment deleted.',
              `delete-${assignment.id}`,
            );
          }}
          title="Delete Draft Assignment?"
          message={`Are you sure you want to permanently delete draft "${assignment.title}"?`}
          impactDetails={['This action cannot be undone.']}
          confirmText="Delete Draft"
          variant="danger"
          loading={savingActionId === `delete-${assignment.id}`}
        />
      )}
    </article>
  );
}

function statusSpine(status: AssignmentResponse['status']): 'ink' | 'ochre' | 'green' | 'red' {
  if (status === 'Draft') return 'ochre';
  if (status === 'Published') return 'green';
  if (status === 'Closed') return 'red';
  return 'ink';
}
