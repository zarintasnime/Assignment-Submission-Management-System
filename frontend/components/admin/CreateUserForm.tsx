import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';

interface CreateUserFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function CreateUserForm({ onSubmit, loading }: CreateUserFormProps) {
  return (
    <article className="panel-card status-spine spine-ink">
      <div className="panel-card-heading">
        <span>01</span>
        <h3>Account Registration &amp; Role Assignment</h3>
      </div>
      <p className="card-subtext">
        Register new accounts into CampusFlow and assign their system role (Teacher, Student, or Admin). Once created, Students can be enrolled into Classrooms and Teachers can be mapped to Subjects.
      </p>
      
      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-grid-two-col">
          <FormField id="user-fullName" label="Full Legal Name" required hint="e.g. Dr. Eleanor Vance or John Doe">
            <input
              id="user-fullName"
              className="field-control"
              name="fullName"
              placeholder="Enter full legal name"
              required
            />
          </FormField>

          <FormField id="user-email" label="Institutional Email" required hint="Used for portal login and notifications">
            <input
              id="user-email"
              className="field-control"
              name="email"
              type="email"
              placeholder="e.g. user@university.edu"
              required
            />
          </FormField>
        </div>

        <div className="form-grid-two-col">
          <FormField id="user-password" label="Temporary Password" required hint="Minimum 8 characters">
            <input
              id="user-password"
              className="field-control"
              name="password"
              type="password"
              minLength={8}
              placeholder="••••••••"
              required
            />
          </FormField>

          <FormField id="user-role" label="Assign System Role" required hint="Determines initial portal access & permissions">
            <select id="user-role" className="field-control" name="role" defaultValue="Teacher">
              <option value="Teacher">Teacher (Faculty — Creates &amp; grades assignments)</option>
              <option value="Student">Student (Learner — Submits assignments &amp; views marks)</option>
              <option value="Admin">Admin (Institutional Controller &amp; Academic setup)</option>
            </select>
          </FormField>
        </div>

        <SubmitButton loading={loading} loadingText="Registering Account & Assigning Role...">
          Register Account &amp; Assign Role
        </SubmitButton>
      </form>
    </article>
  );
}
