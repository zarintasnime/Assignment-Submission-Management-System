import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';

interface CreateClassroomFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function CreateClassroomForm({ onSubmit, loading }: CreateClassroomFormProps) {
  return (
    <article className="panel-card status-spine spine-ochre">
      <div className="panel-card-heading">
        <span>02</span>
        <h3>Create classroom</h3>
      </div>
      <p className="card-subtext">Classrooms serve as the parent context for subjects, enrollments, and teacher mappings.</p>

      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-grid-two-col">
          <FormField id="room-name" label="Classroom name" required hint="e.g. Computer Science Cohort 56">
            <input
              id="room-name"
              className="field-control"
              name="name"
              placeholder="Classroom display name"
              required
            />
          </FormField>

          <FormField id="room-code" label="Classroom code" required hint="Unique identifier e.g. CSE-56">
            <input
              id="room-code"
              className="field-control code-input"
              name="code"
              placeholder="e.g. CSE-56"
              required
            />
          </FormField>
        </div>

        <div className="form-grid-two-col">
          <FormField id="room-academicYear" label="Academic year" hint="Optional, e.g. 2026-2027">
            <input
              id="room-academicYear"
              className="field-control"
              name="academicYear"
              placeholder="e.g. 2026-2027"
            />
          </FormField>

          <FormField id="room-section" label="Section / Batch" hint="Optional, e.g. Section A">
            <input
              id="room-section"
              className="field-control"
              name="section"
              placeholder="e.g. Section A"
            />
          </FormField>
        </div>

        <SubmitButton loading={loading} loadingText="Creating classroom...">
          Create classroom
        </SubmitButton>
      </form>
    </article>
  );
}
