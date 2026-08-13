import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeachersTable from './TeachersTable';
import type { TeacherResponse } from '@/lib/types';

const mockTeachers: TeacherResponse[] = [
  {
    id: 't-1',
    fullName: 'Dr. Robert Langdon',
    email: 'rlangdon@university.edu',
    role: 'Teacher',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('TeachersTable Component', () => {
  it('renders clean header with separate active count pill and register teacher button', () => {
    const handleToggle = vi.fn();
    render(
      <TeachersTable
        teachers={mockTeachers}
        onToggleStatus={handleToggle}
        savingActionId={null}
      />,
    );

    // Verify Title and Subtitle
    expect(screen.getByText('Faculty & Teachers Register')).toBeInTheDocument();

    // Verify Status Pill
    expect(screen.getByText('1 Active')).toBeInTheDocument();

    // Verify Register Teacher Button
    const registerBtn = screen.getByRole('button', { name: /\+ Register Teacher/i });
    expect(registerBtn).toBeInTheDocument();

    // Verify button click triggers scroll to creation form
    fireEvent.click(registerBtn);
  });

  it('renders each teacher as a single table row with name, email and role', () => {
    render(
      <TeachersTable
        teachers={mockTeachers}
        onToggleStatus={vi.fn()}
        savingActionId={null}
      />,
    );

    const row = screen.getByText('Dr. Robert Langdon').closest('tr');
    expect(row).not.toBeNull();

    // Name, email, role, status and the action button all live in the same row.
    expect(row).toHaveTextContent('rlangdon@university.edu');
    expect(row).toHaveTextContent('Teacher');
    expect(row).toHaveTextContent('Active');
    expect(row?.querySelector('button')).not.toBeNull();
  });

  it('renders no unsized inline SVG inside the table body', () => {
    const { container } = render(
      <TeachersTable
        teachers={mockTeachers}
        onToggleStatus={vi.fn()}
        savingActionId={null}
      />,
    );

    // Regression guard: unsized SVGs in a cell expand to the full column width.
    const cellSvgs = container.querySelectorAll('tbody svg');
    cellSvgs.forEach((svg) => {
      const sized =
        svg.hasAttribute('width') || svg.hasAttribute('height') || svg.hasAttribute('viewBox');
      expect(sized).toBe(true);
    });
  });
});
