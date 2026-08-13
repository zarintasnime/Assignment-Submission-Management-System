import React, { FormEvent } from 'react';
import Modal from '../ui/Modal';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { AssignmentResponse, TeacherAssignmentResponse } from '@/lib/types';

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentResponse | null;
  mappings: TeacherAssignmentResponse[];
  onSubmit: (event: FormEvent<HTMLFormElement>, assignment: AssignmentResponse) => Promise<void>;
  loading: boolean;
}

export default function EditAssignmentModal({
  isOpen,
  onClose,
  assignment,
  mappings,
  onSubmit,
  loading,
}: EditAssignmentModalProps) {
  if (!assignment) return null;

  const activeMappings = mappings.filter((m) => m.isActive);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Draft: ${assignment.title}`}
      subtitle="Update assignment details before publishing to students."
      maxWidth="lg"
    >
      <form
        className="assignment-form edit-modal-form"
        onSubmit={(e) => void onSubmit(e, assignment)}
      >
        <FormField
          id="edit-mappingId"
          label="Classroom & Subject context"
          required
          className="field-wide"
        >
          <select
            id="edit-mappingId"
            className="field-control"
            name="mappingId"
            defaultValue={assignment.teacherAssignmentId}
            required
          >
            {activeMappings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.classRoomName} — {item.subjectName}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="edit-title" label="Title" required className="field-wide">
          <input
            id="edit-title"
            className="field-control"
            name="title"
            defaultValue={assignment.title}
            required
          />
        </FormField>

        <FormField id="edit-description" label="Instructions" required className="field-full">
          <textarea
            id="edit-description"
            className="field-control textarea-control"
            name="description"
            defaultValue={assignment.description}
            required
          />
        </FormField>

        <FormField id="edit-deadline" label="Deadline" required>
          <input
            id="edit-deadline"
            className="field-control code-input"
            name="deadline"
            type="datetime-local"
            defaultValue={toDateTimeLocal(assignment.deadline)}
            required
          />
        </FormField>

        <FormField id="edit-maxMarks" label="Max marks" required>
          <input
            id="edit-maxMarks"
            className="field-control code-input"
            name="maxMarks"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={assignment.maxMarks}
            required
          />
        </FormField>

        <FormField id="edit-graceMinutes" label="Grace minutes" required>
          <input
            id="edit-graceMinutes"
            className="field-control code-input"
            name="graceMinutes"
            type="number"
            min="0"
            defaultValue={assignment.graceMinutes}
            required
          />
        </FormField>

        <div className="checkbox-field field-full">
          <input
            id="edit-allowResubmission"
            name="allowResubmission"
            type="checkbox"
            defaultChecked={assignment.allowResubmission}
          />
          <label htmlFor="edit-allowResubmission">
            <strong>Allow student resubmissions</strong>
          </label>
        </div>

        <div className="field-full form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <SubmitButton loading={loading} loadingText="Saving changes...">
            Save changes
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
