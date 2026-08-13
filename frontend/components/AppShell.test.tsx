import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AppShell from './AppShell';
import type { CurrentUser } from '@/lib/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockAdminUser: CurrentUser = {
  id: 'admin-1',
  fullName: 'Admin User',
  email: 'admin@university.edu',
  role: 'Admin',
};

describe('AppShell Component Navigation', () => {
  it('renders navigation links cleanly without decorative link icons', () => {
    render(
      <AppShell me={mockAdminUser} title="Admin Workspace" subtitle="Executive Control Center">
        <div>Content</div>
      </AppShell>,
    );

    // Verify top links and sublinks text exist
    expect(screen.getByText('Overview Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add Teacher')).toBeInTheDocument();
    expect(screen.getByText('Add Student')).toBeInTheDocument();
    expect(screen.getByText('Create Classroom')).toBeInTheDocument();

    // Verify decorative emojis like 📊, ➕, 👥 are NOT present in the navigation text content
    const navElement = screen.getByRole('navigation', { name: /primary navigation/i });
    expect(navElement.textContent).not.toContain('📊');
    expect(navElement.textContent).not.toContain('➕');
    expect(navElement.textContent).not.toContain('👥');
  });

  it('renders dropdown chevron indicator for collapsible group buttons', () => {
    render(
      <AppShell me={mockAdminUser} title="Admin Workspace" subtitle="Executive Control Center">
        <div>Content</div>
      </AppShell>,
    );

    const facultyGroupBtn = screen.getByRole('button', { name: /faculty & learners/i });
    expect(facultyGroupBtn).toBeInTheDocument();

    // Verify dropdown arrow indicator is present
    expect(facultyGroupBtn.textContent).toContain('▶');
  });

  it('invokes onNavigate callback when a sublink is clicked', () => {
    const handleNavigate = vi.fn();
    render(
      <AppShell
        me={mockAdminUser}
        title="Admin Workspace"
        subtitle="Executive Control Center"
        onNavigate={handleNavigate}
      >
        <div>Content</div>
      </AppShell>,
    );

    const addTeacherLink = screen.getByText('Add Teacher').closest('a');
    expect(addTeacherLink).toBeInTheDocument();

    if (addTeacherLink) {
      fireEvent.click(addTeacherLink);
      expect(handleNavigate).toHaveBeenCalledWith('/admin?tab=users#faculty-students');
    }
  });
});
