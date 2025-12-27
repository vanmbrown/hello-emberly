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
  [key: string]: string | number | boolean | undefined;
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

  // Sanitize props - only allow semantic data
  const sanitizedProps: AllowedProps = {};
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      // Only allow: timestamps, state names, booleans, enums
      if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'string' && value.length < 50) // Short strings only (state names, enums)
      ) {
        sanitizedProps[key] = value;
      } else {
        console.warn(`Analytics: Blocked prop "${key}" - contains non-semantic data`);
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

