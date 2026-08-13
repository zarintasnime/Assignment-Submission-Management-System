import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { ClassRoomResponse } from '@/lib/types';

interface CreateSubjectFormProps {
  rooms: ClassRoomResponse[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function CreateSubjectForm({ rooms, onSubmit, loading }: CreateSubjectFormProps) {
  const activeRooms = rooms.filter((r) => r.isActive);

  return (
    <article className="panel-card status-spine spine-green">
      <div className="panel-card-heading">
        <span>03</span>
        <h3>Create subject</h3>
      </div>
      <p className="card-subtext">Every subject MUST belong to an active Classroom context in the academic hierarchy.</p>

      <form className="form-stack" onSubmit={onSubmit}>
        <FormField
          id="subject-classRoomId"
          label="Assigned classroom"
          required
          hint="Select the classroom this subject belongs to"
        >
          <select
            id="subject-classRoomId"
            className="field-control"
            name="classRoomId"
            defaultValue=""
            required
          >
            <option value="" disabled>
              -- Select Active Classroom * --
            </option>
            {activeRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </FormField>

        <div className="form-grid-two-col">
          <FormField id="subject-name" label="Subject title" required hint="e.g. Software Engineering">
            <input
              id="subject-name"
              className="field-control"
              name="name"
              placeholder="Subject full title"
              required
            />
          </FormField>

          <FormField id="subject-code" label="Subject code" required hint="Course code e.g. CSE-4501">
            <input
              id="subject-code"
              className="field-control code-input"
              name="code"
              placeholder="e.g. CSE-4501"
              required
            />
          </FormField>
        </div>

        {activeRooms.length === 0 && (
          <div className="inline-note inline-note-warning">
            Create an active Classroom first (Step 2) before adding Subjects.
          </div>
        )}

        <SubmitButton
          loading={loading}
          disabled={activeRooms.length === 0}
          loadingText="Creating subject..."
        >
          Create subject
        </SubmitButton>
      </form>
    </article>
  );
}
