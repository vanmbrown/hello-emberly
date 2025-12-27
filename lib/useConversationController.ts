/**
 * Centralized conversation controller hook.
 * Handles all side effects (API calls, abort, analytics) outside the state machine.
 * Keeps the state machine pure and components thinner.
 */

import { useState, useRef, useCallback } from 'react';
import { State, Event, transitionState } from '@/lib/stateMachine';
import { apiClient } from '@/lib/api';
import { emit } from '@/lib/analytics';

export interface UseConversationControllerReturn {
  state: State;
  inputText: string;
  responseText: string;
  errorMessage: string | null;
  setInputText: (text: string) => void;
  dispatch: (event: Event) => void;
  abort: () => void;
}

export function useConversationController(): UseConversationControllerReturn {
  const [state, setState] = useState<State>('idle');
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Handle API request (side effect)
   */
  const handleApiRequest = useCallback(async (text: string) => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    emit('api.request_started');

    try {
      const response = await apiClient.respond(text, 'en-US', abortController);
      setResponseText(response.text);

      // Transition to speaking
      const transition = transitionState('thinking', 'RESOLVE');
      if (transition) {
        setState(transition.state);
        emit('state.transition', {
          state: transition.state,
          previousState: 'thinking',
          event: transition.event,
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was canceled - state already handled
        return;
      }

      emit('api.request_failed');

      // Transition to error
      const transition = transitionState('thinking', 'FAIL');
      if (transition) {
        setState(transition.state);
        emit('state.transition', {
          state: transition.state,
          previousState: 'thinking',
          event: transition.event,
        });
        setErrorMessage('The request failed. Please try again.');
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Abort current request
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Dispatch an event to the state machine and handle side effects
   */
  const dispatch = useCallback(
    (event: Event) => {
      const transition = transitionState(state, event);
      if (!transition) {
        return; // Invalid transition
      }

      setState(transition.state);

      // Emit analytics
      emit('state.transition', {
        state: transition.state,
        previousState: transition.previousState,
        event: transition.event,
      });

      // Handle side effects based on state (outside state machine)
      if (transition.state === 'thinking') {
        // Start API request
        handleApiRequest(inputText);
      } else if (transition.state === 'canceled') {
        // Cancel: abort request, clear input, no persistence
        abort();
        setInputText('');
        emit('ui.cancel_clicked');
      } else if (transition.state === 'error') {
        // Error: abort request if still running
        abort();
      } else if (transition.state === 'listening' && transition.previousState === 'speaking') {
        // Continue: clear response, ready for new input
        setResponseText('');
        setInputText('');
        setErrorMessage(null);
      } else if (transition.state === 'idle') {
        // Reset everything when returning to idle
        setInputText('');
        setResponseText('');
        setErrorMessage(null);
        apiClient.reset();
      }
    },
    [state, inputText, handleApiRequest, abort]
  );

  return {
    state,
    inputText,
    responseText,
    errorMessage,
    setInputText,
    dispatch,
    abort,
  };
}

