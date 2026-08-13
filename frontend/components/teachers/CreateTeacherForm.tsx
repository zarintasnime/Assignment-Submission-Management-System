import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';

interface CreateTeacherFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function CreateTeacherForm({ onSubmit, loading }: CreateTeacherFormProps) {
  return (
    <article className="panel-card status-spine spine-indigo">
      <div className="panel-card-heading">
        <span>T1</span>
        <h3>Add New Teacher</h3>
      </div>
      <p className="card-subtext">Register a verified faculty member to manage assigned classes & subjects.</p>
      
      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-grid-two-col">
          <FormField id="teacher-fullName" label="Full Name" required hint="e.g. Dr. Robert Langdon">
            <input
              id="teacher-fullName"
              className="field-control"
              name="fullName"
              placeholder="Enter teacher's full legal name"
              required
            />
          </FormField>

          <FormField id="teacher-email" label="Institutional Email" required hint="Used for teacher portal sign-in">
            <input
              id="teacher-email"
              className="field-control"
              name="email"
              type="email"
              placeholder="e.g. rlangdon@university.edu"
              required
            />
          </FormField>
        </div>

        <FormField id="teacher-password" label="Temporary Password" required hint="Minimum 8 characters">
          <input
            id="teacher-password"
            className="field-control"
            name="password"
            type="password"
            minLength={8}
            placeholder="••••••••"
            required
          />
        </FormField>

        <SubmitButton loading={loading} loadingText="Registering Teacher...">
          Register Teacher Account
        </SubmitButton>
      </form>
    </article>
  );
}
