import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { ClassRoomResponse, StudentResponse } from '@/lib/types';

interface TeacherEnrollStudentFormProps {
  students: StudentResponse[];
  classRooms: ClassRoomResponse[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function TeacherEnrollStudentForm({
  students,
  classRooms,
  onSubmit,
  loading,
}: TeacherEnrollStudentFormProps) {
  return (
    <article className="panel-card status-spine spine-indigo">
      <div className="panel-card-heading">
        <span>E1</span>
        <h3>Assign Student to Class</h3>
      </div>
      <p className="card-subtext">Enroll a student into one of your active classrooms.</p>

      <form className="form-stack" onSubmit={onSubmit}>
        <FormField id="teacher-enroll-student" label="Select Student" required hint="Choose an active student">
          <select id="teacher-enroll-student" className="field-control" name="studentId" defaultValue="">
            <option value="" disabled>-- Select Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.email})
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="teacher-enroll-classroom" label="Select ClassRoom" required hint="Only assigned classrooms are listed">
          <select id="teacher-enroll-classroom" className="field-control" name="classRoomId" defaultValue="">
            <option value="" disabled>-- Select ClassRoom --</option>
            {classRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </FormField>

        <SubmitButton loading={loading} loadingText="Enrolling Student...">
          Enroll Student in Class
        </SubmitButton>
      </form>
    </article>
  );
}
