// src/app/api/proxy/route.ts
import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL parameter is missing', {status: 400});
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Mimic a real browser to avoid simple bot blockers
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      redirect: 'follow',
    });

    const headers = new Headers(response.headers);
    // Strip security headers that prevent embedding
    headers.delete('X-Frame-Options');
    headers.delete('Content-Security-Policy');
    // Set a new CSP that allows embedding
    headers.set('Content-Security-Policy', 'frame-ancestors *');

    const body = await response.text();
    
    // Some sites use base tags, which can mess up relative paths.
    // We'll inject our own base tag to fix this.
    const modifiedBody = body.replace(
      '<head>',
      `<head><base href="${targetUrl}">`
    );

    return new NextResponse(modifiedBody, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Failed to fetch the URL through proxy.', {
      status: 500,
    });
  }
}
