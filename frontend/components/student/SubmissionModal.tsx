import React, { FormEvent } from 'react';
import Modal from '../ui/Modal';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { AssignmentResponse, SubmissionResponse } from '@/lib/types';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: AssignmentResponse | null;
  submission?: SubmissionResponse | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function SubmissionModal({
  isOpen,
  onClose,
  assignment,
  submission,
  onSubmit,
  loading,
}: SubmissionModalProps) {
  const isResubmission = !!submission;
  const title = isResubmission
    ? `Resubmit: ${submission.assignmentTitle} (Version ${submission.currentVersion + 1})`
    : `Submit Assignment: ${assignment?.title ?? ''}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={
        isResubmission
          ? 'Submitting a new version preserves history and clears any previous grade for re-evaluation.'
          : 'Your submission will be saved as an immutable Version 1.'
      }
      maxWidth="md"
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <FormField
          id="submission-answerText"
          label={isResubmission ? 'Revised Answer Text' : 'Answer Text'}
          required
          hint="Provide your complete answer or report below"
        >
          <textarea
            id="submission-answerText"
            className="field-control textarea-control"
            name="answerText"
            maxLength={20000}
            placeholder="Type or paste your complete assignment solution..."
            required
          />
        </FormField>

        <div className="inline-note">
          {isResubmission
            ? `Version ${submission.currentVersion + 1} will be recorded.`
            : 'Version 1 will be recorded with timestamp.'}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <SubmitButton loading={loading} loadingText="Submitting solution...">
            {isResubmission ? `Submit Version ${submission.currentVersion + 1}` : 'Submit Version 1'}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
