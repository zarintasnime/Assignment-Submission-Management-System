'use client';

import { useEffect, useState } from 'react';

export default function SummaryCard({
  label,
  value,
  hint,
  accent = 'ink',
}: {
  label: string;
  value: number | string;
  hint: string;
  accent?: 'ink' | 'ochre' | 'green' | 'red';
}) {
  const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10);
  const isNumeric = !isNaN(numericValue);
  const [displayValue, setDisplayValue] = useState<number | string>(isNumeric ? 0 : value);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    const target = numericValue;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 600;
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress);
      const current = Math.round(easedProgress * target);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [value, isNumeric, numericValue]);

  return (
    <article className={`summary-card accent-${accent}`}>
      <p className="summary-label">{label}</p>
      <strong className="summary-value">{displayValue}</strong>
      <p className="summary-hint">{hint}</p>
    </article>
  );
}

