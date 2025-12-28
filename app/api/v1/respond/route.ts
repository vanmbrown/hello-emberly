/**
 * Next.js API route proxy for /v1/respond (fallback endpoint)
 * Proxies requests to avoid CORS issues in production.
 * This is a temporary solution until backend CORS is configured.
 * 
 * Safety: No user content is logged. Only semantic error messages.
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.helloemberly.com';
const PROXY_TIMEOUT_MS = 15000; // 15 seconds

// Generate correlation ID if missing
function getCorrelationId(request: NextRequest): string {
  return request.headers.get('X-Correlation-ID') || `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const correlationId = getCorrelationId(request);
    
    // Parse request body (contains user input - never log this)
    const body = await request.json();

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
          // Only forward allowed headers - no cookies or arbitrary headers
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Safe error - no upstream error text, no stack traces
        return NextResponse.json(
          { error: 'API request failed' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        // Timeout - safe error message
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: any) {
    // Safe error logging - no user content, no request/response bodies
    // Only log semantic error type, not the error object itself
    if (error.name) {
      console.error('[API Proxy] Respond failed:', error.name);
    } else {
      console.error('[API Proxy] Respond failed: unknown error');
    }
    
    // Safe error response - no stack traces, no upstream error text
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Correlation-ID',
    },
  });
}

// Reject all other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
