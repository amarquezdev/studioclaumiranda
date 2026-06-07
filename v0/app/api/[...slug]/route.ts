import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'https://studioclaumiranda.onrender.com'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const slug = req.nextUrl.pathname.replace(/^\/api\//, '')
  const target = `${BACKEND}/${slug}${req.nextUrl.search}`

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('content-length')

  const init: RequestInit & { duplex?: string } = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body
    init.duplex = 'half'
  }

  try {
    const res = await fetch(target, init as RequestInit)
    const resHeaders = new Headers(res.headers)
    resHeaders.delete('content-encoding')
    return new NextResponse(res.body, { status: res.status, headers: resHeaders })
  } catch {
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

export const GET    = proxy
export const POST   = proxy
export const PATCH  = proxy
export const PUT    = proxy
export const DELETE = proxy
