/**
 * Analytics stub for Hello Emberly.
 * Only emits semantic events - no content, no user text, no transcripts.
 */

type AllowedEvent = 
  | 'ui.begin_clicked'
  | 'ui.cancel_clicked'
  | 'state.transition'
  | 'api.request_started'
  | 'api.request_failed';

type AllowedProps = {
  timestamp?: number;
  state?: string;
  previousState?: string;
  event?: string;
  result?: 'ok' | 'fail';
  reason?: 'cancel' | 'esc' | 'abort';
};

/**
 * Emit an analytics event with strictly semantic payloads only.
 * 
 * Allowed props: timestamps, state names, booleans, enums.
 * Forbidden: user text, assistant text, transcripts, notes, or any content-derived data.
 */
export function emit(eventName: string, props?: Record<string, any>): void {
  // Validate event name
  const allowedEvents: string[] = [
    'ui.begin_clicked',
    'ui.cancel_clicked',
    'state.transition',
    'api.request_started',
    'api.request_failed',
  ];

  if (!allowedEvents.includes(eventName)) {
    console.warn(`Analytics: Unknown event "${eventName}"`);
    return;
  }

  // Sanitize props - strict allowlist of keys only
  const sanitizedProps: AllowedProps = {};
  if (props) {
    // Allowed keys only
    const allowedKeys: (keyof AllowedProps)[] = [
      'timestamp',
      'state',
      'previousState',
      'event',
      'result',
      'reason',
    ];

    for (const [key, value] of Object.entries(props)) {
      if (!allowedKeys.includes(key as keyof AllowedProps)) {
        console.warn(`Analytics: Blocked prop "${key}" - not in allowlist`);
        continue;
      }

      // Validate value types and enum values
      if (key === 'timestamp' && typeof value === 'number') {
        sanitizedProps.timestamp = value;
      } else if ((key === 'state' || key === 'previousState' || key === 'event') && typeof value === 'string') {
        sanitizedProps[key] = value;
      } else if (key === 'result' && (value === 'ok' || value === 'fail')) {
        sanitizedProps.result = value;
      } else if (key === 'reason' && (value === 'cancel' || value === 'esc' || value === 'abort')) {
        sanitizedProps.reason = value;
      } else {
        console.warn(`Analytics: Blocked prop "${key}" - invalid type or enum value`);
      }
    }
  }

  // Add timestamp if not provided
  if (!sanitizedProps.timestamp) {
    sanitizedProps.timestamp = Date.now();
  }

  // Stub implementation - in production this would send to analytics service
  // Hard rule: never emit transcripts, freeform text, or assistant responses
  console.log('[Analytics]', eventName, sanitizedProps);
}

