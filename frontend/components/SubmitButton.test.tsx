import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SubmitButton from './SubmitButton';

describe('SubmitButton Component', () => {
  it('renders children correctly when idle', () => {
    render(<SubmitButton loading={false}>Submit Form</SubmitButton>);
    expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('renders spinner and loading text when loading is true', () => {
    render(
      <SubmitButton loading={true} loadingText="Saving...">
        Submit Form
      </SubmitButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('prevents double submit clicks when already loading', () => {
    const onClickMock = vi.fn();
    render(
      <SubmitButton loading={true} onClick={onClickMock}>
        Submit
      </SubmitButton>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClickMock).not.toHaveBeenCalled();
  });
});
