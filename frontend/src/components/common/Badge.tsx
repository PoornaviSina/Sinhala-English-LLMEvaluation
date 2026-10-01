import type { ReactNode } from 'react';
import type { Tone } from '../../types';

export function Badge({
  children,
  tone = 'slate',
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  );
}

export const languageTone = (language: string): Tone =>
  (({
    Sinhala: 'purple',
    English: 'blue',
    Singlish: 'orange',
    'Code-Mixed': 'green',
    Noisy: 'slate',
  })[language] as Tone) ?? 'slate';
