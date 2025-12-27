/**
 * Accessibility helpers for Hello Emberly.
 */

/**
 * Check if user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Focus trap for dialogs.
 * Traps focus within the provided element.
 */
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = Array.from(
    element.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  if (focusableElements.length === 0) {
    return () => {}; // No-op if no focusable elements
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Restore focus to a previously focused element.
 */
let previousActiveElement: HTMLElement | null = null;

export function saveFocus(): void {
  if (typeof document !== 'undefined') {
    previousActiveElement = document.activeElement as HTMLElement;
  }
}

export function restoreFocus(): void {
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
    previousActiveElement = null;
  }
}

/**
 * Handle ESC key to close dialogs.
 */
export function createEscHandler(onEscape: () => void): () => void {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape();
    }
  };

  document.addEventListener('keydown', handleEsc);

  return () => {
    document.removeEventListener('keydown', handleEsc);
  };
}

/**
 * Disable Lenis smooth scroll if reduced motion is preferred.
 */
export function configureLenisForReducedMotion(lenisInstance: any): void {
  if (prefersReducedMotion() && lenisInstance) {
    lenisInstance.stop();
  }
}

/**
 * Disable GSAP animations if reduced motion is preferred.
 */
export function configureGSAPForReducedMotion(): void {
  if (prefersReducedMotion() && typeof window !== 'undefined' && (window as any).gsap) {
    (window as any).gsap.globalTimeline.timeScale(0);
  }
}

