'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/a11y';

export default function EmberVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasReducedMotion = prefersReducedMotion();

  useEffect(() => {
    // Check prefersReducedMotion() before starting any animations
    // If reduced motion is enabled, animations should not start
    if (hasReducedMotion) {
      return; // Don't start animations
    }

    // GSAP animation would go here
    // For now, just a static visual
    // In production, this would animate when reduced motion is disabled
  }, [hasReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="w-32 h-32 mx-auto mb-8 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}

