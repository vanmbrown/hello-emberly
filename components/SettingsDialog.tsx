'use client';

import { useState, useEffect, useRef } from 'react';
import { clearConstellation } from '@/lib/storage';
import { createFocusTrap, createEscHandler, saveFocus, restoreFocus } from '@/lib/a11y';
import copy from '@/content/copy.json';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [isClearing, setIsClearing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const focusTrapCleanupRef = useRef<(() => void) | null>(null);
  const escHandlerCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return;
    }

    saveFocus();
    focusTrapCleanupRef.current = createFocusTrap(dialogRef.current);
    escHandlerCleanupRef.current = createEscHandler(onClose);

    return () => {
      if (focusTrapCleanupRef.current) {
        focusTrapCleanupRef.current();
      }
      if (escHandlerCleanupRef.current) {
        escHandlerCleanupRef.current();
      }
      restoreFocus();
    };
  }, [isOpen, onClose]);

  const handleClearConstellation = async () => {
    setIsClearing(true);
    // Stubbed for Sprint 1 - no real clearing
    await clearConstellation();
    setIsClearing(false);
    // In Sprint 2, this would actually clear and refresh the constellation display
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <h2 id="settings-title" className="text-2xl font-light mb-6">
          Settings
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Constellation</h3>
            <button
              onClick={handleClearConstellation}
              disabled={isClearing}
              className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            >
              {isClearing ? 'Clearing...' : copy.constellation.clearButton}
            </button>
            <p className="text-xs text-foreground/50 mt-2">
              (Clearing is stubbed for Sprint 1)
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

