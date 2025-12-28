/**
 * API client for Hello Emberly.
 * Handles session-based requests with fallback to direct endpoint.
 * 
 * Uses Next.js API proxy routes to avoid CORS issues when enabled.
 * This is a temporary solution until backend CORS is configured.
 * 
 * Kill-switch: Set NEXT_PUBLIC_USE_API_PROXY=false to revert to direct API calls
 * once backend CORS is configured.
 */

const USE_API_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY !== 'false'; // Default to true
const PROXY_BASE_URL = '/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.helloemberly.com';

// Determine base URL based on proxy toggle
function getBaseUrl(): string {
  return USE_API_PROXY ? PROXY_BASE_URL : API_BASE_URL;
}

export interface SessionResponse {
  session_id: string;
}

export interface RespondRequest {
  input_text: string;
  client: {
    platform: 'web';
    locale: string;
  };
}

export interface RespondResponse {
  assistant_message_id: string;
  text: string;
  policy: {
    flags: string[];
  };
}

class ApiClient {
  private sessionId: string | null = null;
  private useFallback: boolean = false;
  private correlationId: string = '';

  /**
   * Generate a correlation ID for request tracking.
   */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new session.
   */
  async createSession(): Promise<string> {
    if (this.useFallback) {
      // If we're using fallback, don't try to create sessions
      return '';
    }

    this.correlationId = this.generateCorrelationId();

    try {
      // Use proxy or direct API based on environment toggle
      const response = await fetch(`${getBaseUrl()}/v1/voice/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': this.correlationId,
        },
        body: JSON.stringify({}),
      });

      if (response.status === 404 || response.status === 501) {
        // Fallback to direct endpoint
        this.useFallback = true;
        return '';
      }

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.status}`);
      }

      const data: SessionResponse = await response.json();
      this.sessionId = data.session_id;
      return this.sessionId;
    } catch (error) {
      // On error, fall back to direct endpoint
      this.useFallback = true;
      return '';
    }
  }

  /**
   * Send a message and get a response.
   */
  async respond(
    inputText: string,
    locale: string = 'en-US',
    abortController?: AbortController
  ): Promise<RespondResponse> {
    this.correlationId = this.generateCorrelationId();

    // Ensure we have a session (if not using fallback)
    if (!this.useFallback && !this.sessionId) {
      await this.createSession();
    }

    const requestBody: RespondRequest = {
      input_text: inputText,
      client: {
        platform: 'web',
        locale,
      },
    };

    let url: string;
    const baseUrl = getBaseUrl();
    if (this.useFallback || !this.sessionId) {
      // Use fallback endpoint
      url = `${baseUrl}/v1/respond`;
    } else {
      // Use session endpoint
      url = `${baseUrl}/v1/voice/sessions/${this.sessionId}/respond`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': this.correlationId,
      },
      body: JSON.stringify(requestBody),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Reset the session (for new conversations).
   */
  reset(): void {
    this.sessionId = null;
    this.useFallback = false;
    this.correlationId = '';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

