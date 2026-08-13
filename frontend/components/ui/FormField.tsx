import React, { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`form-field-group ${className}`}>
      <label htmlFor={id} className="field-label">
        <span className="field-label-text">
          {label}
          {required && <span className="required-star" aria-hidden="true"> *</span>}
        </span>
        {children}
      </label>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error-msg">{error}</p>}
    </div>
  );
}
