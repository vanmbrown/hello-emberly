'use client';

import { useEffect, useRef } from 'react';
import { transitionState } from '@/lib/stateMachine';
import { apiClient } from '@/lib/api';
import { useConversationController } from '@/lib/useConversationController';
import { createFocusTrap, createEscHandler, saveFocus, restoreFocus } from '@/lib/a11y';
import copy from '@/content/copy.json';

interface VoiceComposerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceComposerDialog({ isOpen, onClose }: VoiceComposerDialogProps) {
  const {
    state,
    inputText,
    responseText,
    errorMessage,
    setInputText,
    dispatch,
    abort,
  } = useConversationController();

  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusTrapCleanupRef = useRef<(() => void) | null>(null);
  const escHandlerCleanupRef = useRef<(() => void) | null>(null);

  // Setup focus trap and ESC handler when dialog opens
  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return;
    }

    // Transition to listening when dialog opens
    if (state === 'idle') {
      dispatch('BEGIN');
    }

    saveFocus();
    focusTrapCleanupRef.current = createFocusTrap(dialogRef.current);
    escHandlerCleanupRef.current = createEscHandler(() => {
      if (state === 'listening' || state === 'thinking') {
        dispatch('CANCEL');
      }
      onClose();
    });

    // Focus textarea when listening
    if (state === 'listening' && textareaRef.current) {
      textareaRef.current.focus();
    }

    return () => {
      if (focusTrapCleanupRef.current) {
        focusTrapCleanupRef.current();
      }
      if (escHandlerCleanupRef.current) {
        escHandlerCleanupRef.current();
      }
      restoreFocus();
    };
  }, [isOpen, state, dispatch, onClose]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      dispatch('BACK'); // Reset to idle
      apiClient.reset();
      abort();
    }
  }, [isOpen, dispatch, abort]);

  // Focus textarea when transitioning to listening from speaking
  useEffect(() => {
    if (state === 'listening' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (inputText.trim()) {
      dispatch('SUBMIT');
    }
  };

  const handleCancel = () => {
    dispatch('CANCEL');
    onClose();
  };

  const handleBack = () => {
    dispatch('BACK');
    if (state === 'error' || state === 'canceled') {
      onClose();
    }
  };

  const handleContinue = () => {
    dispatch('CONTINUE');
  };

  const handleReplay = () => {
    dispatch('REPLAY');
    // REPLAY doesn't call API - just shows response again
  };

  const handleTryAgain = () => {
    const transition = transitionState('error', 'BACK');
    if (transition) {
      dispatch('BACK');
      // Will transition to idle, then we can start fresh
      setTimeout(() => {
        dispatch('BEGIN');
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Listening State */}
        {state === 'listening' && (
          <>
            <h2 id="dialog-title" className="text-2xl font-light mb-2">
              {copy.listening.headline}
            </h2>
            <p className="text-foreground/70 mb-6">
              {copy.listening.subtext}
            </p>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Type your message here..."
              className="w-full min-h-[120px] p-4 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent mb-4"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                {copy.listening.cancelButton}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                {copy.listening.sendButton}
              </button>
            </div>
          </>
        )}

        {/* Thinking State */}
        {state === 'thinking' && (
          <>
            <h2 id="dialog-title" className="text-2xl font-light mb-2">
              {copy.thinking.headline}
            </h2>
            <p className="text-foreground/70 mb-6">
              {copy.thinking.subtext}
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                {copy.thinking.cancelButton}
              </button>
            </div>
          </>
        )}

        {/* Speaking State */}
        {state === 'speaking' && (
          <>
            <h2 id="dialog-title" className="text-2xl font-light mb-2">
              {copy.speaking.headline}
            </h2>
            <div className="mb-6 p-4 bg-foreground/5 rounded-lg min-h-[100px]">
              <p className="text-foreground whitespace-pre-wrap">{responseText}</p>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleReplay}
                className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                {copy.speaking.replayButton}
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                {copy.speaking.continueButton}
              </button>
            </div>
          </>
        )}

        {/* Error State - Visually distinct with warm/neutral tones */}
        {state === 'error' && (
          <>
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h2 id="dialog-title" className="text-2xl font-light mb-2 text-amber-800 dark:text-amber-300">
                {copy.error.headline}
              </h2>
              <p className="text-amber-700 dark:text-amber-400 mb-4">
                {copy.error.subtext}
              </p>
              {errorMessage && (
                <p className="text-sm text-amber-600 dark:text-amber-500">{errorMessage}</p>
              )}
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                {copy.error.backButton}
              </button>
              <button
                onClick={handleTryAgain}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
              >
                {copy.error.tryAgainButton}
              </button>
            </div>
          </>
        )}

        {/* Canceled State - Neutral, not warning-like */}
        {state === 'canceled' && (
          <>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h2 id="dialog-title" className="text-2xl font-light mb-2 text-gray-700 dark:text-gray-300">
                {copy.canceled.headline}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {copy.canceled.subtext}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
              >
                {copy.canceled.backButton}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
