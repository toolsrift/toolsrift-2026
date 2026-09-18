// robots.txt for a standalone network site. Reached via the middleware rewrite
// of /robots.txt (lib/sites + middleware.js). The hub keeps public/robots.txt.
import { SITE } from '../../../lib/sites'

export default function handler(req, res) {
  if (!SITE.isStandalone) return res.status(404).end()
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.status(200).send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      '',
      `Sitemap: ${SITE.baseUrl}/sitemap.xml`,
      '',
    ].join('\n')
  )
}
