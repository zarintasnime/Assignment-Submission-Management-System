'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import SummaryCard from '@/components/SummaryCard';
import { ErrorState, LoadingState } from '@/components/States';
import { useToast } from '@/components/Toast';
import WorkflowStepper from '@/components/ui/WorkflowStepper';
import CreateUserForm from '@/components/admin/CreateUserForm';
import CreateClassroomForm from '@/components/admin/CreateClassroomForm';
import CreateSubjectForm from '@/components/admin/CreateSubjectForm';
import EnrollStudentForm from '@/components/admin/EnrollStudentForm';
import MapTeacherForm from '@/components/admin/MapTeacherForm';
import UsersTable from '@/components/admin/UsersTable';
import ClassroomsTable from '@/components/admin/ClassroomsTable';
import SubjectsTable from '@/components/admin/SubjectsTable';
import EnrollmentsTable from '@/components/admin/EnrollmentsTable';
import TeacherMappingsTable from '@/components/admin/TeacherMappingsTable';
import AuditLogsTable from '@/components/admin/AuditLogsTable';
import { api, getMe } from '@/lib/api';
import type {
  AssignmentResponse,
  AuditLogResponse,
  ClassRoomResponse,
  CurrentUser,
  EnrollmentResponse,
  SubjectResponse,
  SubmissionResponse,
  TeacherAssignmentResponse,
  UserResponse,
  UserRole,
} from '@/lib/types';

const ADMIN_TABS = ['overview', 'users', 'academics', 'allocations', 'audit', 'all'] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

function isAdminTab(value: string | null): value is AdminTab {
  return value !== null && (ADMIN_TABS as readonly string[]).includes(value);
}

export default function AdminPage() {
  const { showSuccess, showError } = useToast();
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [rooms, setRooms] = useState<ClassRoomResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [mappings, setMappings] = useState<TeacherAssignmentResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingActionId, setSavingActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSectionTab, setActiveSectionTab] = useState<AdminTab>('overview');

  // Sync section tab with URL query search params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (isAdminTab(tabParam)) {
        setActiveSectionTab(tabParam);
      }
    }
  }, []);

  const activeStudents = useMemo(
    () => users.filter((user) => user.role === 'Student' && user.isActive),
    [users],
  );
  const activeTeachers = useMemo(
    () => users.filter((user) => user.role === 'Teacher' && user.isActive),
    [users],
  );
  const totalTeachersCount = useMemo(
    () => users.filter((user) => user.role === 'Teacher').length,
    [users],
  );
  const totalStudentsCount = useMemo(
    () => users.filter((user) => user.role === 'Student').length,
    [users],
  );

  async function load() {
    setLoading(true);
    setError('');

    try {
      const currentUser = await getMe();
      if (currentUser.role !== 'Admin') {
        window.location.href = '/login';
        return;
      }

      setMe(currentUser);
      const [
        userData,
        roomData,
        subjectData,
        mappingData,
        enrollmentData,
        assignmentData,
        submissionData,
        auditData,
      ] = await Promise.all([
        api<UserResponse[]>('/admin/users'),
        api<ClassRoomResponse[]>('/admin/classrooms'),
        api<SubjectResponse[]>('/admin/subjects'),
        api<TeacherAssignmentResponse[]>('/admin/teacher-assignments'),
        api<EnrollmentResponse[]>('/admin/enrollments'),
        api<AssignmentResponse[]>('/admin/oversight/assignments'),
        api<SubmissionResponse[]>('/admin/oversight/submissions'),
        api<AuditLogResponse[]>('/admin/audit-logs?take=8'),
      ]);

      setUsers(userData);
      setRooms(roomData);
      setSubjects(subjectData);
      setMappings(mappingData);
      setEnrollments(enrollmentData);
      setAssignments(assignmentData);
      setSubmissions(submissionData);
      setAuditLogs(auditData);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to load admin workspace.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function refetchAuditLogs() {
    try {
      const auditData = await api<AuditLogResponse[]>('/admin/audit-logs?take=8');
      setAuditLogs(auditData);
    } catch {
      // Ignore background refetch failure
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSavingActionId('create-user');
    setError('');
    setNotice('');

    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: String(data.get('fullName') ?? ''),
          email: String(data.get('email') ?? ''),
          password: String(data.get('password') ?? ''),
          role: String(data.get('role') ?? 'Student'),
        }),
      });

      form.reset();
      const msg = 'Account registered & role assigned successfully.';
      setNotice(msg);
      showSuccess(msg);

      const updatedUsers = await api<UserResponse[]>('/admin/users');
      setUsers(updatedUsers);
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to create user.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }


  async function handleCreateClassroom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSavingActionId('create-classroom');
    setError('');
    setNotice('');

    try {
      await api('/admin/classrooms', {
        method: 'POST',
        body: JSON.stringify({
          name: String(data.get('name') ?? ''),
          code: String(data.get('code') ?? ''),
          academicYear: String(data.get('academicYear') ?? '') || undefined,
          section: String(data.get('section') ?? '') || undefined,
        }),
      });

      form.reset();
      const msg = 'Classroom created successfully.';
      setNotice(msg);
      showSuccess(msg);

      const updatedRooms = await api<ClassRoomResponse[]>('/admin/classrooms');
      setRooms(updatedRooms);
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to create classroom.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleCreateSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSavingActionId('create-subject');
    setError('');
    setNotice('');

    try {
      await api('/admin/subjects', {
        method: 'POST',
        body: JSON.stringify({
          name: String(data.get('name') ?? ''),
          code: String(data.get('code') ?? ''),
          classRoomId: String(data.get('classRoomId') ?? ''),
        }),
      });

      form.reset();
      const msg = 'Subject created successfully.';
      setNotice(msg);
      showSuccess(msg);

      const updatedSubjects = await api<SubjectResponse[]>('/admin/subjects');
      setSubjects(updatedSubjects);
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to create subject.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleToggleUserStatus(user: UserResponse) {
    const actionId = `user-${user.id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const updated = await api<UserResponse>(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: user.fullName,
          role: user.role,
          isActive: !user.isActive,
        }),
      });

      const nextStatus = updated.isActive ? 'activated' : 'deactivated';
      const msg = `User ${updated.fullName} was ${nextStatus}.`;
      setNotice(msg);
      showSuccess(msg);

      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to update user status.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleUpdateUser(
    id: string,
    fullName: string,
    email: string,
    role: UserRole,
    isActive: boolean,
  ) {
    const actionId = `update-user-${id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const updated = await api<UserResponse>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName,
          email,
          role,
          isActive,
        }),
      });

      const msg = `User ${updated.fullName} details & assigned role (${updated.role}) updated successfully.`;
      setNotice(msg);
      showSuccess(msg);

      const updatedUsers = await api<UserResponse[]>('/admin/users');
      setUsers(updatedUsers);
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to update user profile & role.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }


  async function handleToggleClassroomStatus(room: ClassRoomResponse) {
    const actionId = `room-${room.id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const updated = await api<ClassRoomResponse>(`/admin/classrooms/${room.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: room.name,
          code: room.code,
          academicYear: room.academicYear,
          section: room.section,
          isActive: !room.isActive,
        }),
      });

      const nextStatus = updated.isActive ? 'activated' : 'deactivated';
      const msg = `Classroom ${updated.name} was ${nextStatus}.`;
      setNotice(msg);
      showSuccess(msg);

      setRooms((prev) => prev.map((item) => (item.id === room.id ? updated : item)));
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to update classroom status.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleToggleSubjectStatus(subject: SubjectResponse) {
    const actionId = `subject-${subject.id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      const updated = await api<SubjectResponse>(`/admin/subjects/${subject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: subject.name,
          code: subject.code,
          classRoomId: subject.classRoomId ?? null,
          isActive: !subject.isActive,
        }),
      });

      const nextStatus = updated.isActive ? 'activated' : 'deactivated';
      const msg = `Subject ${updated.name} was ${nextStatus}.`;
      setNotice(msg);
      showSuccess(msg);

      setSubjects((prev) => prev.map((item) => (item.id === subject.id ? updated : item)));
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to update subject status.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleEnrollStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSavingActionId('create-enrollment');
    setError('');
    setNotice('');

    try {
      await api('/admin/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          studentId: String(data.get('studentId') ?? ''),
          classRoomId: String(data.get('classRoomId') ?? ''),
        }),
      });

      form.reset();
      const msg = 'Student enrollment created.';
      setNotice(msg);
      showSuccess(msg);

      const updatedEnrollments = await api<EnrollmentResponse[]>('/admin/enrollments');
      setEnrollments(updatedEnrollments);
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to create enrollment.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleMapTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSavingActionId('create-mapping');
    setError('');
    setNotice('');

    try {
      await api('/admin/teacher-assignments', {
        method: 'POST',
        body: JSON.stringify({
          teacherId: String(data.get('teacherId') ?? ''),
          classRoomId: String(data.get('classRoomId') ?? ''),
          subjectId: String(data.get('subjectId') ?? ''),
        }),
      });

      form.reset();
      const msg = 'Teacher mapping created successfully.';
      setNotice(msg);
      showSuccess(msg);

      const updatedMappings = await api<TeacherAssignmentResponse[]>('/admin/teacher-assignments');
      setMappings(updatedMappings);
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to create teacher mapping.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleDeactivateEnrollment(id: string) {
    const actionId = `deactivate-enrollment-${id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      await api<void>(`/admin/enrollments/${id}/deactivate`, { method: 'POST' });
      const msg = 'Enrollment deactivated.';
      setNotice(msg);
      showSuccess(msg);

      setEnrollments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
      );
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to deactivate enrollment.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function handleDeactivateMapping(id: string) {
    const actionId = `deactivate-mapping-${id}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      await api<void>(`/admin/teacher-assignments/${id}/deactivate`, { method: 'POST' });
      const msg = 'Teacher mapping deactivated.';
      setNotice(msg);
      showSuccess(msg);

      setMappings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
      );
      void refetchAuditLogs();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to deactivate mapping.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  // Handle programmatic navigation from sidebar links
  function handleSidebarNavigate(href: string) {
    if (!href.includes('/admin')) return;

    try {
      const url = new URL(href, window.location.origin);
      const tabParam = url.searchParams.get('tab');
      if (isAdminTab(tabParam)) {
        setActiveSectionTab(tabParam);
      }

      const hash = url.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      }
    } catch {
      // Fallback
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
        <ErrorState message={error || 'Admin access is required.'} onRetry={load} />
      </main>
    );
  }

  return (
    <AppShell
      me={me}
      title="Executive Academic Control Center"
      subtitle="Organized management suite for faculty accounts, student enrollments, classrooms, subjects, and system oversight."
      onNavigate={handleSidebarNavigate}
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

      {/* Primary KPI Metrics Summary Bar */}
      <section className="summary-grid">
        <SummaryCard label="Faculty" value={totalTeachersCount} hint={`${activeTeachers.length} active teachers`} accent="ink" />
        <SummaryCard label="Learners" value={totalStudentsCount} hint={`${activeStudents.length} active students`} accent="green" />
        <SummaryCard label="Classrooms" value={rooms.length} hint={`${rooms.filter((r) => r.isActive).length} active cohorts`} accent="ochre" />
        <SummaryCard label="Subjects" value={subjects.length} hint={`${subjects.filter((s) => s.isActive).length} course offerings`} accent="red" />
      </section>

      {/* Executive Workspace Section Switcher Navigation Tabs */}
      <nav className="admin-tab-nav" aria-label="Admin workspace sections navigation">
        <button
          type="button"
          className={`admin-tab-btn ${activeSectionTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSectionTab('overview')}
        >
          📊 Overview Dashboard
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSectionTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSectionTab('users')}
        >
          👥 Faculty &amp; Learners
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSectionTab === 'academics' ? 'active' : ''}`}
          onClick={() => setActiveSectionTab('academics')}
        >
          🏫 Academic Setup
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSectionTab === 'allocations' ? 'active' : ''}`}
          onClick={() => setActiveSectionTab('allocations')}
        >
          🔗 Enrollments &amp; Mappings
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSectionTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSectionTab('audit')}
        >
          📜 Audit Trail
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSectionTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSectionTab('all')}
        >
          ⚡ View All Workspaces
        </button>
      </nav>

      {/* Overview Dashboard Tab Content */}
      {(activeSectionTab === 'overview' || activeSectionTab === 'all') && (
        <div className="section-block">
          {/* Guided Academic Workflow Stepper */}
          <WorkflowStepper currentStep={subjects.length === 0 ? 3 : enrollments.length === 0 ? 4 : 5} />

          {/* Quick Action Launchpad */}
          <section className="section-block">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">Quick Actions</span>
                <h2>Administrative Launchpad</h2>
                <p>Jump directly into specialized management forms and creation suites with zero clutter.</p>
              </div>
            </div>

            <div className="quick-actions-grid">
              <button
                type="button"
                className="quick-action-tile"
                onClick={() => setActiveSectionTab('users')}
              >
                <span className="quick-action-icon">👤</span>
                <strong>Register Account</strong>
                <small>Create teacher, student, or admin account</small>
              </button>

              <button
                type="button"
                className="quick-action-tile"
                onClick={() => setActiveSectionTab('academics')}
              >
                <span className="quick-action-icon">🏫</span>
                <strong>Create Classroom</strong>
                <small>Form academic cohorts</small>
              </button>

              <button
                type="button"
                className="quick-action-tile"
                onClick={() => setActiveSectionTab('academics')}
              >
                <span className="quick-action-icon">📚</span>
                <strong>Add Subject</strong>
                <small>Define course offerings</small>
              </button>

              <button
                type="button"
                className="quick-action-tile"
                onClick={() => setActiveSectionTab('allocations')}
              >
                <span className="quick-action-icon">🔗</span>
                <strong>Map Teacher</strong>
                <small>Assign class &amp; subject authority</small>
              </button>

              <button
                type="button"
                className="quick-action-tile"
                onClick={() => setActiveSectionTab('allocations')}
              >
                <span className="quick-action-icon">📝</span>
                <strong>Enroll Student</strong>
                <small>Grant assignment eligibility</small>
              </button>
            </div>
          </section>

          {/* Recent Audit Feed Widget */}
          <section className="section-block">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">Security &amp; Compliance</span>
                <h2>Recent Administrative Actions</h2>
                <p>Real-time audit record of system activities, account registrations, and authority assignments.</p>
              </div>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => setActiveSectionTab('audit')}
              >
                Full Audit Trail →
              </button>
            </div>
            <AuditLogsTable auditLogs={auditLogs.slice(0, 5)} />
          </section>
        </div>
      )}

      {/* Account Registration & User Management Section */}
      {(activeSectionTab === 'users' || activeSectionTab === 'all') && (
        <section className="section-block" id="faculty-students">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">Account Management</span>
              <h2>Account Registration &amp; Role Assignment</h2>
              <p>Register new accounts and assign system roles. Use the table below to edit existing users or reassign roles.</p>
            </div>
          </div>

          <div className="form-card-grid-1">
            <CreateUserForm
              onSubmit={handleCreateUser}
              loading={savingActionId === 'create-user'}
            />
          </div>

          {/* Unified User Data Table */}
          <div id="tables" style={{ marginTop: '28px' }}>
            <UsersTable
              users={users}
              me={me}
              onToggleStatus={handleToggleUserStatus}
              onUpdateUser={handleUpdateUser}
              savingActionId={savingActionId}
            />
          </div>
        </section>
      )}

      {/* Academic Setup Section */}
      {(activeSectionTab === 'academics' || activeSectionTab === 'all') && (
        <section className="section-block" id="academics">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">Academic Setup</span>
              <h2>Classrooms &amp; Subjects Suite</h2>
              <p>Every subject belongs to a classroom, forming the controlled context for enrollment and teaching.</p>
            </div>
          </div>

          <div className="form-card-grid-2">
            <CreateClassroomForm
              onSubmit={handleCreateClassroom}
              loading={savingActionId === 'create-classroom'}
            />
            <CreateSubjectForm
              rooms={rooms}
              onSubmit={handleCreateSubject}
              loading={savingActionId === 'create-subject'}
            />
          </div>

          {/* Academic Data Tables */}
          <div id="tables" style={{ marginTop: '28px' }}>
            <ClassroomsTable
              rooms={rooms}
              onToggleStatus={handleToggleClassroomStatus}
              savingActionId={savingActionId}
            />
            <SubjectsTable
              subjects={subjects}
              onToggleStatus={handleToggleSubjectStatus}
              savingActionId={savingActionId}
            />
          </div>
        </section>
      )}

      {/* Assignments & Enrollments Section */}
      {(activeSectionTab === 'allocations' || activeSectionTab === 'all') && (
        <section className="section-block" id="enrollments-and-mappings">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">Assignments &amp; Enrollments</span>
              <h2>Teacher Mappings &amp; Student Enrollments</h2>
              <p>Admin control for assigning teachers to Class+Subject and enrolling students into ClassRooms.</p>
            </div>
          </div>

          <div className="form-card-grid-2">
            <MapTeacherForm
              teachers={activeTeachers}
              rooms={rooms}
              subjects={subjects}
              onSubmit={handleMapTeacher}
              loading={savingActionId === 'create-mapping'}
            />
            <EnrollStudentForm
              students={activeStudents}
              rooms={rooms}
              onSubmit={handleEnrollStudent}
              loading={savingActionId === 'create-enrollment'}
            />
          </div>

          {/* Allocation Data Tables */}
          <div id="tables" style={{ marginTop: '28px' }}>
            <TeacherMappingsTable
              mappings={mappings}
              onDeactivate={handleDeactivateMapping}
              savingActionId={savingActionId}
            />
            <EnrollmentsTable
              enrollments={enrollments}
              onDeactivate={handleDeactivateEnrollment}
              savingActionId={savingActionId}
            />
          </div>
        </section>
      )}

      {/* Security & Audit Section */}
      {(activeSectionTab === 'audit' || activeSectionTab === 'all') && (
        <section className="section-block" id="audit">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">Security &amp; Audit Oversight</span>
              <h2>Full System Audit Log</h2>
              <p>Complete immutable audit trail of administrative activities, logins, and status modifications.</p>
            </div>
          </div>
          <AuditLogsTable auditLogs={auditLogs} />
        </section>
      )}
    </AppShell>
  );
}
