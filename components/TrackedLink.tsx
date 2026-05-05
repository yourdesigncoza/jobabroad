'use client';

import { track } from '@vercel/analytics';
import type { ReactNode } from 'react';

interface Props {
  href: string;
  event: string;
  data?: Record<string, string | number | boolean | null>;
  className?: string;
  style?: React.CSSProperties;
  external?: boolean;
  children: ReactNode;
}

export default function TrackedLink({
  href,
  event,
  data,
  className,
  style,
  external = true,
  children,
}: Props) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={() => track(event, data)}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
