import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // www served a full 200 mirror of the site. The canonical tags pointed at the
  // apex so nothing was double-indexed, but Googlebot still spent 492 of ~2,900
  // crawl requests (17%) re-crawling the duplicate host — budget that belongs to
  // the tool pages still waiting in "Discovered – currently not indexed".
  if (host.startsWith('www.')) {
    url.host = host.slice(4)
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

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
