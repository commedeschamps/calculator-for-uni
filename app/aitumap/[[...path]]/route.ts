import { type NextRequest } from 'next/server';

const UPSTREAM_BASE_URL = 'https://yuujiso.github.io/aitumap';

export const runtime = 'nodejs';

function buildUpstreamUrl(pathSegments: string[] = [], search = ''): string {
  const pathname = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/';
  return `${UPSTREAM_BASE_URL}${pathname}${search}`;
}

function createProxyHeaders(upstreamHeaders: Headers): Headers {
  const headers = new Headers();
  const allowedHeaders = [
    'cache-control',
    'content-type',
    'etag',
    'expires',
    'last-modified',
    'vary',
  ];

  for (const headerName of allowedHeaders) {
    const value = upstreamHeaders.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  headers.set('x-robots-tag', 'noindex');

  return headers;
}

async function proxyRequest(request: NextRequest, pathSegments?: string[]) {
  const upstreamUrl = buildUpstreamUrl(pathSegments, request.nextUrl.search);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        accept: request.headers.get('accept') ?? '*/*',
      },
      next: {
        revalidate: 3600,
      },
    });

    return new Response(
      request.method === 'HEAD' ? null : upstreamResponse.body,
      {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: createProxyHeaders(upstreamResponse.headers),
      },
    );
  } catch {
    return new Response('Campus map is unavailable right now.', {
      status: 502,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }
}

type RouteContext = {
  params: {
    path?: string[];
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path);
}
