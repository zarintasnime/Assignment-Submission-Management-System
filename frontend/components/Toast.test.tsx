import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './Toast';

function TestConsumer() {
  const { showToast, showSuccess, showError } = useToast();
  return (
    <div>
      <button onClick={() => showSuccess('User created successfully')}>Trigger Success</button>
      <button onClick={() => showError('Failed to update record')}>Trigger Error</button>
      <button onClick={() => showToast('Custom warning message', 'warning', 1000)}>
        Trigger Warning
      </button>
    </div>
  );
}

describe('Toast Component & Provider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders success toast when triggered and allows manual dismiss via X button', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Success'));

    expect(screen.getByText('User created successfully')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);

    expect(screen.queryByText('User created successfully')).not.toBeInTheDocument();
  });

  it('automatically dismisses toast after duration', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Warning'));

    expect(screen.getByText('Custom warning message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.queryByText('Custom warning message')).not.toBeInTheDocument();
  });
});
