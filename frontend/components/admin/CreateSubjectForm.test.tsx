import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CreateSubjectForm from './CreateSubjectForm';

describe('CreateSubjectForm Component', () => {
  const dummyRooms = [
    {
      id: 'room-1',
      name: 'Computer Science 56',
      code: 'CSE-56',
      academicYear: '2026',
      section: 'A',
      isActive: true,
    },
  ];

  it('renders required classroom select, subject title, and subject code labels', () => {
    const handleSubmit = vi.fn();
    render(<CreateSubjectForm rooms={dummyRooms} onSubmit={handleSubmit} loading={false} />);

    expect(screen.getByLabelText(/Assigned classroom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create subject/i })).toBeInTheDocument();
  });
});
