'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'outline' | 'quiet' | 'danger-outline';
  size?: 'normal' | 'large' | 'small';
  block?: boolean;
  children: ReactNode;
}

export default function SubmitButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'normal',
  block = false,
  disabled,
  className = '',
  children,
  ...props
}: SubmitButtonProps) {
  const isButtonDisabled = disabled || loading;
  const sizeClass = size === 'large' ? 'btn-large' : size === 'small' ? 'btn-small' : '';
  const blockClass = block ? 'btn-block' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      {...props}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${loading ? 'btn-is-loading' : ''} ${className}`.trim()}
      disabled={isButtonDisabled}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
