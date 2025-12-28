/**
 * Next.js API route proxy for /v1/voice/sessions
 * Proxies requests to avoid CORS issues in production.
 * This is a temporary solution until backend CORS is configured.
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.helloemberly.com';

export async function POST(request: NextRequest) {
  try {
    const correlationId = request.headers.get('X-Correlation-ID') || '';
    
    const response = await fetch(`${API_BASE_URL}/v1/voice/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Session creation failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Proxy] Session creation error:', error);
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

