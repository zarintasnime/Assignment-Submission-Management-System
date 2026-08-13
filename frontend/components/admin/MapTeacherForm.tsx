import React, { FormEvent, useMemo, useState } from 'react';
import FormField from '../ui/FormField';
import SubmitButton from '../SubmitButton';
import type { ClassRoomResponse, SubjectResponse, UserResponse } from '@/lib/types';

interface MapTeacherFormProps {
  teachers: UserResponse[];
  rooms: ClassRoomResponse[];
  subjects: SubjectResponse[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function MapTeacherForm({
  teachers,
  rooms,
  subjects,
  onSubmit,
  loading,
}: MapTeacherFormProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const activeRooms = useMemo(() => rooms.filter((r) => r.isActive), [rooms]);

  // Cascading Filter: Only show subjects that belong to the selected classroom (or all active if none selected)
  const filteredSubjects = useMemo(() => {
    const activeSubjects = subjects.filter((s) => s.isActive);
    if (!selectedClassId) return activeSubjects;
    return activeSubjects.filter(
      (s) => !s.classRoomId || s.classRoomId === selectedClassId,
    );
  }, [subjects, selectedClassId]);

  return (
    <article className="panel-card">
      <div className="panel-card-heading">
        <span>05</span>
        <h3>Map teacher to class &amp; subject</h3>
      </div>
      <p className="card-subtext">
        Teachers gain authority to create and grade assignments only for assigned Class + Subject combinations.
      </p>

      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-grid-two-col">
          <FormField id="map-teacherId" label="Teacher user" required hint="Select active teacher account">
            <select
              id="map-teacherId"
              className="field-control"
              name="teacherId"
              defaultValue=""
              required
            >
              <option value="" disabled>
                -- Select Teacher * --
              </option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} ({teacher.email})
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="map-classRoomId"
            label="Classroom"
            required
            hint="Selecting a classroom filters eligible subjects below"
          >
            <select
              id="map-classRoomId"
              className="field-control"
              name="classRoomId"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
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

        <FormField
          id="map-subjectId"
          label="Subject"
          required
          hint={
            selectedClassId
              ? `Filtered for selected classroom (${filteredSubjects.length} subject${filteredSubjects.length === 1 ? '' : 's'} available)`
              : 'Select a classroom first to filter subjects'
          }
        >
          <select
            id="map-subjectId"
            className="field-control"
            name="subjectId"
            defaultValue=""
            disabled={!selectedClassId}
            required
          >
            <option value="" disabled>
              {selectedClassId
                ? filteredSubjects.length > 0
                  ? '-- Select Subject * --'
                  : 'No subjects belong to this classroom yet'
                : 'Select Classroom first'}
            </option>
            {filteredSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </FormField>

        <SubmitButton
          loading={loading}
          disabled={!selectedClassId || filteredSubjects.length === 0}
          loadingText="Creating teacher mapping..."
        >
          Create teacher mapping
        </SubmitButton>
      </form>
    </article>
  );
}
