'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatusChip from '@/components/StatusChip';
import SummaryCard from '@/components/SummaryCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { useToast } from '@/components/Toast';
import CreateAssignmentForm from '@/components/teacher/CreateAssignmentForm';
import EditAssignmentModal from '@/components/teacher/EditAssignmentModal';
import AssignmentCard from '@/components/teacher/AssignmentCard';
import SubmissionReviewPanel from '@/components/teacher/SubmissionReviewPanel';
import TeacherEnrollStudentForm from '@/components/enrollments/TeacherEnrollStudentForm';
import StudentsTable from '@/components/students/StudentsTable';
import { api, getMe } from '@/lib/api';
import { getStudents, getTeacherStudents } from '@/lib/api/students';
import { getTeacherEnrollments, teacherEnrollStudent } from '@/lib/api/enrollments';
import type {
  AssignmentResponse,
  ClassRoomResponse,
  CurrentUser,
  DashboardResponse,
  EnrollmentResponse,
  StudentResponse,
  SubmissionResponse,
  TeacherAssignmentResponse,
} from '@/lib/types';

export default function TeacherPage() {
  const { showSuccess, showError } = useToast();
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [mappings, setMappings] = useState<TeacherAssignmentResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentResponse | null>(null);

  // Student & Enrollment state
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);
  const [myStudents, setMyStudents] = useState<StudentResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [savingActionId, setSavingActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId],
  );

  // Unique assigned classrooms for teacher
  const assignedClassRooms = useMemo(() => {
    const map = new Map<string, ClassRoomResponse>();
    mappings.forEach((m) => {
      if (m.isActive && !map.has(m.classRoomId)) {
        map.set(m.classRoomId, {
          id: m.classRoomId,
          name: m.classRoomName,
          code: m.classRoomName,
          academicYear: null,
          section: null,
          isActive: true,
        });
      }
    });
    return Array.from(map.values());
  }, [mappings]);

  const publishedCount = assignments.filter((item) => item.status === 'Published').length;
  const dueSoonCount = assignments.filter((item) => {
    if (item.status !== 'Published') return false;
    const remaining = new Date(item.deadline).getTime() - Date.now();
    return remaining > 0 && remaining <= 48 * 60 * 60 * 1000;
  }).length;

  async function load() {
    setLoading(true);
    setError('');

    try {
      const currentUser = await getMe();
      if (currentUser.role !== 'Teacher') {
        window.location.href = '/login';
        return;
      }

      setMe(currentUser);
      const [
        mappingData,
        assignmentData,
        dashboardData,
        teacherStudentsData,
        allStudentsData,
        enrollmentData,
      ] = await Promise.all([
        api<TeacherAssignmentResponse[]>('/teacher/mappings'),
        api<AssignmentResponse[]>('/teacher/assignments'),
        api<DashboardResponse>('/dashboard'),
        getTeacherStudents().catch(() => []),
        getStudents().catch(() => []),
        getTeacherEnrollments().catch(() => []),
      ]);

      setMappings(mappingData);
      setAssignments(assignmentData);
      setDashboard(dashboardData);
      setMyStudents(teacherStudentsData);
      setAllStudents(allStudentsData.filter((s) => s.isActive));
      setEnrollments(enrollmentData);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to load teacher workspace.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function refetchAssignments() {
    try {
      const assignmentData = await api<AssignmentResponse[]>('/teacher/assignments');
      setAssignments(assignmentData);
    } catch {
      // Ignore background refetch fail
    }
  }

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSavingActionId('create-assignment');
    setError('');
    setNotice('');

    try {
      const deadlineInput = String(data.get('deadline') ?? '');
      await api<AssignmentResponse>('/teacher/assignments', {
        method: 'POST',
        body: JSON.stringify({
          teacherAssignmentId: String(data.get('mappingId') ?? ''),
          title: String(data.get('title') ?? ''),
          description: String(data.get('description') ?? ''),
          deadline: new Date(deadlineInput).toISOString(),
          maxMarks: Number(data.get('maxMarks')),
          allowResubmission: data.get('allowResubmission') === 'on',
          graceMinutes: Number(data.get('graceMinutes') ?? 0),
        }),
      });

      form.reset();
      const msg = 'Draft assignment created. Review it, then publish when ready.';
      setNotice(msg);
      showSuccess(msg);

      await refetchAssignments();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to create assignment.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function updateAssignment(event: FormEvent<HTMLFormElement>, assignment: AssignmentResponse) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const actionId = `edit-${assignment.id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const deadlineInput = String(data.get('deadline') ?? '');
      await api<AssignmentResponse>(`/teacher/assignments/${assignment.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          teacherAssignmentId: String(data.get('mappingId') ?? assignment.teacherAssignmentId),
          title: String(data.get('title') ?? assignment.title),
          description: String(data.get('description') ?? assignment.description),
          deadline: new Date(deadlineInput).toISOString(),
          maxMarks: Number(data.get('maxMarks')),
          allowResubmission: data.get('allowResubmission') === 'on',
          graceMinutes: Number(data.get('graceMinutes') ?? 0),
        }),
      });

      setEditingAssignment(null);
      const msg = 'Draft assignment updated successfully.';
      setNotice(msg);
      showSuccess(msg);

      await refetchAssignments();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to update assignment.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function assignmentAction(
    path: string,
    method: 'POST' | 'DELETE',
    message: string,
    actionId: string,
  ) {
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      await api(path, { method });
      setNotice(message);
      showSuccess(message);

      await refetchAssignments();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to update assignment.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function loadSubmissions(assignmentId: string) {
    setSelectedAssignmentId(assignmentId);
    setSubmissionsLoading(true);
    setError('');

    try {
      const items = await api<SubmissionResponse[]>(
        `/teacher/assignments/${assignmentId}/submissions`,
      );
      setSubmissions(items);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to load submissions.';
      setError(msg);
      showError(msg);
    } finally {
      setSubmissionsLoading(false);
    }
  }

  async function gradeSubmission(
    event: FormEvent<HTMLFormElement>,
    submission: SubmissionResponse,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const actionId = `grade-${submission.id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const marks = Number(formData.get('marks'));
      const feedback = String(formData.get('feedback') ?? '');

      const updated = await api<SubmissionResponse>(
        `/teacher/submissions/${submission.id}/grade`,
        {
          method: 'POST',
          body: JSON.stringify({ marks, feedback }),
        },
      );

      setSubmissions((prev) => prev.map((item) => (item.id === submission.id ? updated : item)));
      const msg = 'Submission graded successfully.';
      setNotice(msg);
      showSuccess(msg);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to grade submission.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function returnSubmission(
    event: FormEvent<HTMLFormElement>,
    submissionId: string,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const actionId = `return-${submissionId}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const feedback = String(formData.get('feedback') ?? '');

      const updated = await api<SubmissionResponse>(
        `/teacher/submissions/${submissionId}/return`,
        {
          method: 'POST',
          body: JSON.stringify({ feedback }),
        },
      );

      setSubmissions((prev) => prev.map((item) => (item.id === submissionId ? updated : item)));
      const msg = 'Submission returned for revision.';
      setNotice(msg);
      showSuccess(msg);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to return submission.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleTeacherEnrollStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSavingActionId('teacher-enroll-student');
    setError('');
    setNotice('');

    try {
      await teacherEnrollStudent({
        studentId: String(formData.get('studentId') ?? ''),
        classRoomId: String(formData.get('classRoomId') ?? ''),
      });

      form.reset();
      const msg = 'Student enrolled into classroom successfully.';
      setNotice(msg);
      showSuccess(msg);

      const [updatedMyStudents, updatedEnrollments] = await Promise.all([
        getTeacherStudents(),
        getTeacherEnrollments(),
      ]);
      setMyStudents(updatedMyStudents);
      setEnrollments(updatedEnrollments);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to enroll student.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  if (loading) {
    return (
      <main className="standalone-state">
        <LoadingState cards={6} />
      </main>
    );
  }

  if (!me) {
    return (
      <main className="standalone-state">
        <ErrorState message={error || 'Teacher access is required.'} onRetry={load} />
      </main>
    );
  }

  return (
    <AppShell
      me={me}
      title="Teacher Assignment Desk"
      subtitle="Create assignments from assigned teaching contexts, publish deliberately, evaluate student work, and manage student enrollments."
    >
      {error && (
        <div className="alert alert-error alert-with-dismiss" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="alert-close-btn"
            aria-label="Close error alert"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}
      {notice && (
        <div className="alert alert-success alert-with-dismiss" role="status">
          <span>{notice}</span>
          <button
            type="button"
            className="alert-close-btn"
            aria-label="Close notice alert"
            onClick={() => setNotice('')}
          >
            ✕
          </button>
        </div>
      )}

      <section className="summary-grid summary-grid-three">
        <SummaryCard
          label="Published"
          value={publishedCount}
          hint="Visible to eligible students"
          accent="green"
        />
        <SummaryCard
          label="My Enrolled Students"
          value={myStudents.length}
          hint="Students in my assigned classes"
          accent="ochre"
        />
        <SummaryCard
          label="Ungraded"
          value={dashboard?.ungradedSubmissions ?? 0}
          hint="Submissions awaiting evaluation"
          accent="red"
        />
      </section>

      {/* Student Enrollment Section for Teacher */}
      <section className="section-block" id="student-enrollment">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Class Roster</span>
            <h2>Student Enrollments</h2>
            <p>Enroll students into your assigned academic classrooms.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TeacherEnrollStudentForm
              students={allStudents}
              classRooms={assignedClassRooms}
              onSubmit={handleTeacherEnrollStudent}
              loading={savingActionId === 'teacher-enroll-student'}
            />
          </div>
          <div className="lg:col-span-2">
            <StudentsTable
              students={myStudents}
              onToggleStatus={async () => {}}
              savingActionId={null}
            />
          </div>
        </div>
      </section>

      <section className="section-block" id="create">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Create</span>
            <h2>New Draft Assignment</h2>
            <p>Select from your active Class + Subject authorities to begin drafting.</p>
          </div>
        </div>

        <CreateAssignmentForm
          mappings={mappings}
          onSubmit={createAssignment}
          loading={savingActionId === 'create-assignment'}
        />
      </section>

      <section className="section-block" id="assignments">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Assignments</span>
            <h2>My Assignment Register</h2>
            <p>Drafts can be edited or deleted; published work is open for student submissions.</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments created yet"
            message="Create a draft assignment from your assigned class-subject context above."
          />
        ) : (
          <div className="record-grid">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={(a) => setEditingAssignment(a)}
                onAction={assignmentAction}
                onViewSubmissions={loadSubmissions}
                savingActionId={savingActionId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section-block" id="grading">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Evaluation &amp; Grading</span>
            <h2>Submission Review Panel</h2>
            <p>
              Review student answers, grade within max marks limits, or return work with revision feedback.
            </p>
          </div>
          {selectedAssignment && <StatusChip label={selectedAssignment.title} tone="neutral" />}
        </div>

        <SubmissionReviewPanel
          selectedAssignment={selectedAssignment}
          submissions={submissions}
          loading={submissionsLoading}
          onGrade={gradeSubmission}
          onReturn={returnSubmission}
          savingActionId={savingActionId}
        />
      </section>

      {editingAssignment && (
        <EditAssignmentModal
          isOpen={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          assignment={editingAssignment}
          mappings={mappings}
          onSubmit={(e) => updateAssignment(e, editingAssignment)}
          loading={savingActionId === `edit-${editingAssignment.id}`}
        />
      )}
    </AppShell>
  );
}
