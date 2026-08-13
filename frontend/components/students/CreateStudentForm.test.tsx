import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateStudentForm from './CreateStudentForm';

describe('CreateStudentForm', () => {
  it('renders all form fields and submit button', () => {
    render(<CreateStudentForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Student Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temporary Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Student Profile/i })).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<CreateStudentForm onSubmit={vi.fn()} loading={true} />);

    expect(screen.getByRole('button', { name: /Creating Student Profile.../i })).toBeDisabled();
  });

  it('triggers onSubmit handler when submitted', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<CreateStudentForm onSubmit={handleSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Student' } });
    fireEvent.change(screen.getByLabelText(/Student Email/i), { target: { value: 'jstudent@school.edu' } });
    fireEvent.change(screen.getByLabelText(/Temporary Password/i), { target: { value: 'StudentPass123' } });

    fireEvent.submit(screen.getByRole('button', { name: /Create Student Profile/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
