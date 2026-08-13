'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import SummaryCard from '@/components/SummaryCard';
import { ErrorState, LoadingState } from '@/components/States';
import { api, getMe } from '@/lib/api';
import type { CurrentUser, DashboardResponse } from '@/lib/types';

export default function DashboardPage() {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [user, data] = await Promise.all([
        getMe(),
        api<DashboardResponse>('/dashboard'),
      ]);
      setMe(user);
      setDashboard(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load the dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return <main className="standalone-state"><LoadingState cards={4} /></main>;
  }

  if (error || !me || !dashboard) {
    return (
      <main className="standalone-state">
        <ErrorState message={error || 'Your session could not be loaded.'} onRetry={load} />
      </main>
    );
  }

  const cards = cardsForRole(me.role, dashboard);

  return (
    <AppShell
      me={me}
      title="Dashboard"
      subtitle="A concise view of the records that matter to your role."
    >
      <section className="welcome-strip">
        <div>
          <span className="eyebrow">Signed in as {me.role}</span>
          <h2>{me.fullName}</h2>
          <p>Use the navigation to continue the assignment workflow.</p>
        </div>
        <div className="workflow-mini-map">
          <span>Admin context</span>
          <i />
          <span>Teacher assignment</span>
          <i />
          <span>Student submission</span>
          <i />
          <span>Teacher grade</span>
        </div>
      </section>

      <section className="summary-grid">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </section>
    </AppShell>
  );
}

function cardsForRole(role: CurrentUser['role'], data: DashboardResponse) {
  if (role === 'Admin') {
    return [
      { label: 'Users', value: data.users, hint: 'Managed accounts', accent: 'ink' as const },
      { label: 'Classes', value: data.classes, hint: 'Academic groups', accent: 'ochre' as const },
      { label: 'Subjects', value: data.subjects, hint: 'Subject catalog', accent: 'green' as const },
      { label: 'Assignments', value: data.assignments, hint: 'System-wide records', accent: 'ink' as const },
    ];
  }

  if (role === 'Teacher') {
    return [
      { label: 'Assignments', value: data.assignments, hint: 'Your assignment records', accent: 'ink' as const },
      { label: 'Published', value: data.publishedAssignments, hint: 'Visible to students', accent: 'green' as const },
      { label: 'Submissions', value: data.submissions, hint: 'Received work', accent: 'ochre' as const },
      { label: 'Ungraded', value: data.ungradedSubmissions, hint: 'Needs review', accent: 'red' as const },
    ];
  }

  return [
    { label: 'Assignments', value: data.assignments, hint: 'Eligible work', accent: 'ink' as const },
    { label: 'Published', value: data.publishedAssignments, hint: 'Currently available', accent: 'green' as const },
    { label: 'Submissions', value: data.submissions, hint: 'Your submission records', accent: 'ochre' as const },
    { label: 'Pending grades', value: data.ungradedSubmissions, hint: 'Awaiting teacher review', accent: 'red' as const },
  ];
}
