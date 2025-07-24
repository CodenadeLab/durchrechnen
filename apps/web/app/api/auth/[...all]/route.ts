import { NextRequest } from 'next/server'

// Proxy all auth requests to the API server
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const resolvedParams = await params
  return proxyToAPI(request, resolvedParams.all)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const resolvedParams = await params
  return proxyToAPI(request, resolvedParams.all)
}

async function proxyToAPI(request: NextRequest, pathSegments: string[]) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    return new Response('API URL not configured', { status: 500 })
  }

  const path = pathSegments.join('/')
  const url = `${apiUrl}/api/auth/${path}`
  
  const headers = new Headers(request.headers)
  headers.set('host', new URL(apiUrl).host)
  
  try {
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: request.body,
      // @ts-ignore
      duplex: 'half'
    })
    
    // Forward the response with all headers
    const responseHeaders = new Headers(response.headers)
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Auth proxy error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}