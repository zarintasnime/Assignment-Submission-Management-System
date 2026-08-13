import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateTeacherForm from './CreateTeacherForm';

describe('CreateTeacherForm', () => {
  it('renders all form fields and submit button', () => {
    render(<CreateTeacherForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Institutional Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temporary Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Teacher Account/i })).toBeInTheDocument();
  });

  it('shows loading state when savingActionId is active', () => {
    render(<CreateTeacherForm onSubmit={vi.fn()} loading={true} />);

    expect(screen.getByRole('button', { name: /Registering Teacher.../i })).toBeDisabled();
  });

  it('triggers onSubmit handler when submitted', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<CreateTeacherForm onSubmit={handleSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Institutional Email/i), { target: { value: 'jsmith@univ.edu' } });
    fireEvent.change(screen.getByLabelText(/Temporary Password/i), { target: { value: 'Pass12345' } });

    fireEvent.submit(screen.getByRole('button', { name: /Register Teacher Account/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
