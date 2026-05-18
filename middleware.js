import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  if (host.startsWith('text.')) {
    url.pathname = '/text'
    return NextResponse.rewrite(url)
  }
  if (host.startsWith('image.')) {
    url.pathname = '/images'
    return NextResponse.rewrite(url)
  }
  if (host.startsWith('pdf.')) {
    url.pathname = '/pdf'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon\\.ico|icon|manifest|sw|workbox|\\.well-known).*)'],
}
