'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import SummaryCard from '@/components/SummaryCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { useToast } from '@/components/Toast';
import AssignmentCard, { WindowState } from '@/components/student/AssignmentCard';
import SubmissionModal from '@/components/student/SubmissionModal';
import SubmissionHistoryCard from '@/components/student/SubmissionHistoryCard';
import { api, getMe } from '@/lib/api';
import type { AssignmentResponse, CurrentUser, SubmissionResponse } from '@/lib/types';

export default function StudentPage() {
  const { showSuccess, showError } = useToast();
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingActionId, setSavingActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Modal State
  const [activeSubmitAssignment, setActiveSubmitAssignment] = useState<AssignmentResponse | null>(null);
  const [activeResubmitSubmission, setActiveResubmitSubmission] = useState<SubmissionResponse | null>(null);

  const submittedAssignmentIds = useMemo(
    () => new Set(submissions.map((submission) => submission.assignmentId)),
    [submissions],
  );

  const openCount = assignments.filter((assignment) => {
    const windowState = getWindowState(assignment);
    return (
      assignment.status === 'Published' &&
      windowState.canSubmit &&
      !submittedAssignmentIds.has(assignment.id)
    );
  }).length;

  const submittedCount = submissions.filter((submission) => submission.marks === null).length;
  const gradedCount = submissions.filter((submission) => submission.marks !== null).length;

  async function load() {
    setLoading(true);
    setError('');

    try {
      const currentUser = await getMe();
      if (currentUser.role !== 'Student') {
        window.location.href = '/login';
        return;
      }

      setMe(currentUser);
      const [assignmentData, submissionData] = await Promise.all([
        api<AssignmentResponse[]>('/student/assignments'),
        api<SubmissionResponse[]>('/student/submissions'),
      ]);

      setAssignments(assignmentData);
      setSubmissions(submissionData);
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to load student workspace.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function refetchSubmissions() {
    try {
      const submissionData = await api<SubmissionResponse[]>('/student/submissions');
      setSubmissions(submissionData);
    } catch {
      // Ignore background refetch failure
    }
  }

  async function submitAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSubmitAssignment) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const answerText = String(data.get('answerText') ?? '').trim();

    if (!answerText) {
      const msg = 'Answer is required before submission.';
      setError(msg);
      showError(msg);
      return;
    }

    const assignmentId = activeSubmitAssignment.id;
    const actionId = `submit-${assignmentId}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      await api<SubmissionResponse>(`/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answerText }),
      });

      setActiveSubmitAssignment(null);
      const msg = 'Assignment submitted successfully. Version 1 has been recorded.';
      setNotice(msg);
      showSuccess(msg);

      await refetchSubmissions();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to submit assignment.';
      setError(msg);
      showError(msg);
    } finally {
      setSavingActionId(null);
    }
  }

  async function resubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeResubmitSubmission) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const answerText = String(data.get('answerText') ?? '').trim();

    if (!answerText) {
      const msg = 'A revised answer is required for resubmission.';
      setError(msg);
      showError(msg);
      return;
    }

    const submissionId = activeResubmitSubmission.id;
    const actionId = `resubmit-${submissionId}`;
    setSavingActionId(actionId);
    setError('');
    setNotice('');

    try {
      await api<SubmissionResponse>(`/student/submissions/${submissionId}/resubmit`, {
        method: 'POST',
        body: JSON.stringify({ answerText }),
      });

      setActiveResubmitSubmission(null);
      const msg = 'Resubmission saved as a new version. Any previous grade now requires re-evaluation.';
      setNotice(msg);
      showSuccess(msg);

      await refetchSubmissions();
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Unable to resubmit assignment.';
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
        <ErrorState message={error || 'Student access is required.'} onRetry={load} />
      </main>
    );
  }

  return (
    <AppShell
      me={me}
      title="Student Submission Desk"
      subtitle="View eligible assignments for your active classroom, submit answers, and track version history."
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
          label="Open"
          value={openCount}
          hint="Ready for initial submission"
          accent="green"
        />
        <SummaryCard
          label="Submitted"
          value={submittedCount}
          hint="Awaiting or returned for review"
          accent="ochre"
        />
        <SummaryCard label="Graded" value={gradedCount} hint="Marks released" accent="ink" />
      </section>

      <section className="section-block" id="assignments">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Assignments</span>
            <h2>Eligible Assignment Register</h2>
            <p>Real-world deadline countdown and grace window statuses are tracked before you submit.</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No published assignments"
            message="There is no eligible work published for your active classroom enrollment yet."
          />
        ) : (
          <div className="record-grid">
            {assignments.map((assignment) => {
              const windowState = getWindowState(assignment);
              const alreadySubmitted = submittedAssignmentIds.has(assignment.id);

              return (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  windowState={windowState}
                  alreadySubmitted={alreadySubmitted}
                  onOpenSubmitModal={(a) => setActiveSubmitAssignment(a)}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="section-block" id="submissions">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">History</span>
            <h2>My Submissions</h2>
            <p>Every resubmission creates a new immutable version rather than overwriting past work.</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <EmptyState
            title="No submission history"
            message="Submit an assignment above to record your first version."
          />
        ) : (
          <div className="submission-history-list">
            {submissions.map((submission) => {
              const assignment = assignments.find((item) => item.id === submission.assignmentId);
              return (
                <SubmissionHistoryCard
                  key={submission.id}
                  submission={submission}
                  assignment={assignment}
                  getWindowState={getWindowState}
                  onOpenResubmitModal={(s) => setActiveResubmitSubmission(s)}
                />
              );
            })}
          </div>
        )}
      </section>

      {activeSubmitAssignment && (
        <SubmissionModal
          isOpen={!!activeSubmitAssignment}
          onClose={() => setActiveSubmitAssignment(null)}
          assignment={activeSubmitAssignment}
          onSubmit={submitAssignment}
          loading={savingActionId === `submit-${activeSubmitAssignment.id}`}
        />
      )}

      {activeResubmitSubmission && (
        <SubmissionModal
          isOpen={!!activeResubmitSubmission}
          onClose={() => setActiveResubmitSubmission(null)}
          submission={activeResubmitSubmission}
          onSubmit={resubmit}
          loading={savingActionId === `resubmit-${activeResubmitSubmission.id}`}
        />
      )}
    </AppShell>
  );
}

function getWindowState(assignment: AssignmentResponse): WindowState {
  const now = Date.now();
  const deadline = new Date(assignment.deadline).getTime();
  const graceEnd = deadline + assignment.graceMinutes * 60_000;

  if (now > graceEnd) {
    return {
      label: 'Deadline and grace window passed',
      tone: 'late',
      percent: 100,
      canSubmit: false,
    };
  }

  if (now > deadline) {
    const graceRemainingMinutes = Math.max(0, Math.ceil((graceEnd - now) / 60_000));
    return {
      label: `Deadline passed — grace window open for ${graceRemainingMinutes} min`,
      tone: 'late',
      percent: 94,
      canSubmit: true,
    };
  }

  const hours = Math.ceil((deadline - now) / (60 * 60 * 1000));
  if (hours <= 24) {
    return {
      label: `${hours} hour${hours === 1 ? '' : 's'} remaining`,
      tone: 'soon',
      percent: 80,
      canSubmit: true,
    };
  }

  const days = Math.ceil(hours / 24);
  return {
    label: `${days} day${days === 1 ? '' : 's'} remaining`,
    tone: 'safe',
    percent: Math.max(22, Math.min(66, 70 - days * 2)),
    canSubmit: true,
  };
}
