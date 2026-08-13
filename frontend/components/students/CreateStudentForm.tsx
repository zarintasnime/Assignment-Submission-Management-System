import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';

interface CreateStudentFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function CreateStudentForm({ onSubmit, loading }: CreateStudentFormProps) {
  return (
    <article className="panel-card status-spine spine-emerald">
      <div className="panel-card-heading">
        <span>S1</span>
        <h3>Add New Student</h3>
      </div>
      <p className="card-subtext">Create student profile for enrollment into academic classrooms.</p>
      
      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-grid-two-col">
          <FormField id="student-fullName" label="Full Name" required hint="e.g. Jane Doe">
            <input
              id="student-fullName"
              className="field-control"
              name="fullName"
              placeholder="Enter student's full name"
              required
            />
          </FormField>

          <FormField id="student-email" label="Student Email" required hint="Used for student dashboard sign-in">
            <input
              id="student-email"
              className="field-control"
              name="email"
              type="email"
              placeholder="e.g. jdoe@student.edu"
              required
            />
          </FormField>
        </div>

        <FormField id="student-password" label="Temporary Password" required hint="Minimum 8 characters">
          <input
            id="student-password"
            className="field-control"
            name="password"
            type="password"
            minLength={8}
            placeholder="••••••••"
            required
          />
        </FormField>

        <SubmitButton loading={loading} loadingText="Creating Student Profile...">
          Create Student Profile
        </SubmitButton>
      </form>
    </article>
  );
}
