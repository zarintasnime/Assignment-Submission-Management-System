import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormField from './FormField';

describe('FormField Component', () => {
  it('renders explicit label text and associates with input id', () => {
    render(
      <FormField id="test-input" label="Test Subject Label" required hint="Enter subject code">
        <input id="test-input" />
      </FormField>,
    );

    const label = screen.getByText('Test Subject Label');
    expect(label).toBeInTheDocument();

    const star = screen.getByText('*');
    expect(star).toBeInTheDocument();

    const hint = screen.getByText('Enter subject code');
    expect(hint).toBeInTheDocument();
  });
});
