import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { TeacherAssignmentResponse } from '@/lib/types';

interface CreateAssignmentFormProps {
  mappings: TeacherAssignmentResponse[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function CreateAssignmentForm({
  mappings,
  onSubmit,
  loading,
}: CreateAssignmentFormProps) {
  const activeMappings = mappings.filter((m) => m.isActive);

  return (
    <article className="panel-card status-spine spine-ochre">
      <div className="panel-card-heading">
        <span>Create</span>
        <h3>Create new draft assignment</h3>
      </div>
      <p className="card-subtext">
        Drafts can be edited before publishing. Only active Class + Subject combinations assigned to you appear below.
      </p>

      {activeMappings.length === 0 ? (
        <div className="inline-note inline-note-warning">
          An Admin must map you to a Classroom and Subject before you can create assignments.
        </div>
      ) : (
        <form className="assignment-form" onSubmit={onSubmit}>
          <FormField
            id="create-mappingId"
            label="Classroom & Subject context"
            required
            hint="Select from your assigned teaching authorities"
            className="field-wide"
          >
            <select
              id="create-mappingId"
              className="field-control"
              name="mappingId"
              defaultValue=""
              required
            >
              <option value="" disabled>
                -- Select Teaching Context * --
              </option>
              {activeMappings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.classRoomName} — {item.subjectName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="create-title"
            label="Assignment title"
            required
            hint="Clear topic title (max 200 characters)"
            className="field-wide"
          >
            <input
              id="create-title"
              className="field-control"
              name="title"
              maxLength={200}
              placeholder="e.g. Lab Report 1: System Design"
              required
            />
          </FormField>

          <FormField
            id="create-description"
            label="Task instructions & expectations"
            required
            hint="Detailed problem statement and submission format"
            className="field-full"
          >
            <textarea
              id="create-description"
              className="field-control textarea-control"
              name="description"
              maxLength={5000}
              placeholder="Provide clear instructions for your students..."
              required
            />
          </FormField>

          <FormField
            id="create-deadline"
            label="Submission deadline"
            required
            hint="Local deadline date & time"
          >
            <input
              id="create-deadline"
              className="field-control code-input"
              name="deadline"
              type="datetime-local"
              required
            />
          </FormField>

          <FormField
            id="create-maxMarks"
            label="Maximum marks"
            required
            hint="Grade limit e.g. 100"
          >
            <input
              id="create-maxMarks"
              className="field-control code-input"
              name="maxMarks"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="100"
              required
            />
          </FormField>

          <FormField
            id="create-graceMinutes"
            label="Grace period (minutes)"
            required
            hint="Buffer window after deadline before closure"
          >
            <input
              id="create-graceMinutes"
              className="field-control code-input"
              name="graceMinutes"
              type="number"
              min="0"
              defaultValue="0"
              required
            />
          </FormField>

          <div className="checkbox-field field-full">
            <input id="create-allowResubmission" name="allowResubmission" type="checkbox" defaultChecked />
            <label htmlFor="create-allowResubmission">
              <strong>Allow student resubmissions</strong>
              <small>Submitting a new version preserves history and requests regrading.</small>
            </label>
          </div>

          <div className="field-full form-actions">
            <SubmitButton loading={loading} loadingText="Creating draft assignment...">
              Create draft assignment
            </SubmitButton>
          </div>
        </form>
      )}
    </article>
  );
}
