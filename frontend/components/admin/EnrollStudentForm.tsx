import React, { FormEvent } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { ClassRoomResponse, UserResponse } from '@/lib/types';

interface EnrollStudentFormProps {
  students: UserResponse[];
  rooms: ClassRoomResponse[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function EnrollStudentForm({
  students,
  rooms,
  onSubmit,
  loading,
}: EnrollStudentFormProps) {
  const activeRooms = rooms.filter((r) => r.isActive);

  return (
    <article className="panel-card">
      <div className="panel-card-heading">
        <span>04</span>
        <h3>Enroll student to classroom</h3>
      </div>
      <p className="card-subtext">Students receive assignment eligibility exclusively through active classroom enrollments.</p>

      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-grid-two-col">
          <FormField id="enroll-studentId" label="Student user" required hint="Select active student account">
            <select
              id="enroll-studentId"
              className="field-control"
              name="studentId"
              defaultValue=""
              required
            >
              <option value="" disabled>
                -- Select Student * --
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.email})
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="enroll-classRoomId" label="Classroom" required hint="Select active classroom cohort">
            <select
              id="enroll-classRoomId"
              className="field-control"
              name="classRoomId"
              defaultValue=""
              required
            >
              <option value="" disabled>
                -- Select Classroom * --
              </option>
              {activeRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} — {room.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <SubmitButton loading={loading} loadingText="Enrolling student...">
          Enroll student
        </SubmitButton>
      </form>
    </article>
  );
}
