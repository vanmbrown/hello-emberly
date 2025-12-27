/**
 * Pure state machine for Hello Emberly conversation flow.
 * Handles only state transitions and validation - no side effects.
 */

export type State = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'canceled';

export type Event = 
  | 'BEGIN' 
  | 'SUBMIT' 
  | 'RESOLVE' 
  | 'FAIL' 
  | 'CANCEL' 
  | 'BACK' 
  | 'CONTINUE' 
  | 'REPLAY';

export interface StateTransition {
  state: State;
  previousState: State;
  event: Event;
  context?: Record<string, unknown>;
}

type TransitionRule = {
  from: State;
  event: Event;
  to: State;
  notes?: string;
};

const TRANSITION_RULES: TransitionRule[] = [
  { from: 'idle', event: 'BEGIN', to: 'listening', notes: 'Opens compose modal' },
  { from: 'listening', event: 'SUBMIT', to: 'thinking', notes: 'API request starts' },
  { from: 'listening', event: 'CANCEL', to: 'canceled', notes: 'Nothing saved' },
  { from: 'thinking', event: 'RESOLVE', to: 'speaking', notes: 'Render response' },
  { from: 'thinking', event: 'FAIL', to: 'error', notes: 'Safe error copy' },
  { from: 'thinking', event: 'CANCEL', to: 'canceled', notes: 'Abort request' },
  { from: 'speaking', event: 'CONTINUE', to: 'listening', notes: 'New input' },
  { from: 'speaking', event: 'REPLAY', to: 'speaking', notes: 'No API call' },
  { from: 'error', event: 'BACK', to: 'idle' },
  { from: 'canceled', event: 'BACK', to: 'idle' },
];

/**
 * Pure state machine function.
 * Returns state transition or null if transition is invalid.
 * Never performs side effects.
 */
export function transitionState(
  currentState: State,
  event: Event,
  context?: Record<string, unknown>
): StateTransition | null {
  const rule = TRANSITION_RULES.find(
    (r) => r.from === currentState && r.event === event
  );

  if (!rule) {
    return null; // Invalid transition
  }

  return {
    state: rule.to,
    previousState: currentState,
    event,
    context,
  };
}

/**
 * Validate if a transition is allowed.
 */
export function canTransition(currentState: State, event: Event): boolean {
  return TRANSITION_RULES.some(
    (r) => r.from === currentState && r.event === event
  );
}

/**
 * Get all valid events for a given state.
 */
export function getValidEvents(state: State): Event[] {
  return TRANSITION_RULES
    .filter((r) => r.from === state)
    .map((r) => r.event);
}

