import React, { ReactNode } from 'react';

export function LoadingState({ cards = 3 }: { cards?: number }) {
  return (
    <div className="skeleton-grid" aria-label="Loading" aria-busy="true">
      {Array.from({ length: cards }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-short" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-panel state-error">
      <span className="state-kicker">Unable to load</span>
      <h3>Something needs attention</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-panel state-empty">
      <div className="empty-mark" aria-hidden="true">
        —
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
