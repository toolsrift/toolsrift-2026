// Vercel Cron target — resubmits the full sitemap to every automatable indexing channel
// as a safety net, catching any pages the per-change submission (scripts/submit-indexnow.js
// and scripts/submit-google-sitemap.js) missed. Scheduled in vercel.json; protected by
// CRON_SECRET (Vercel sends it as a Bearer token automatically when the env var is set).
//
// - IndexNow: fans out to Bing, Yandex, Seznam.cz, Naver, Yep in one call.
// - Google: has no general instant-index API; this issues a sitemaps.submit recrawl
//   request via the Search Console API. Requires GOOGLE_SERVICE_ACCOUNT_KEY — skipped
//   (not an error) if that env var isn't set yet. See CLAUDE.md for setup steps.

import { JWT } from 'google-auth-library'
import { HUB_DOMAIN } from '../../../lib/sites'

// Every category lives on toolsrift.com (/pdf, /images, …), so there is one
// host and one sitemap to submit.
const HOST = HUB_DOMAIN
const KEY = '509a62672848f5997b1eb6f154172d3a'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
// toolsrift.com is a Domain property in Search Console (verified via DNS), so the
// Search Console API identifies it as "sc-domain:toolsrift.com", not a URL-prefix
// form.
const SITE_URL = `sc-domain:${HUB_DOMAIN}`
const SITEMAP_URL = `https://${HOST}/sitemap.xml`

// /sitemap.xml is a plain urlset (scripts/generate-sitemap.js). Should it ever
// become a sitemap index again, same-host child sitemaps are expanded here —
// IndexNow only accepts URLs on the submitting host.
async function collectUrls(sitemapUrl, depth = 0) {
  const res = await fetch(sitemapUrl)
  const xml = await res.text()
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim())
  if (!/<sitemapindex/i.test(xml)) return locs
  if (depth > 1) return []
  const own = locs.filter((u) => { try { return new URL(u).host === HOST } catch (_) { return false } })
  const nested = await Promise.all(own.map((u) => collectUrls(u, depth + 1).catch(() => [])))
  return nested.flat()
}

async function submitIndexNow(urlList) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlList.slice(0, 10000),
    }),
  })
  return res.status
}

async function submitGoogleSitemap() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) return 'skipped_not_configured'

  const creds = JSON.parse(raw)
  const client = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  })
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE_URL
  )}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`
  const res = await client.request({ url: endpoint, method: 'PUT' })
  return res.status
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.authorization
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  try {
    const urlList = await collectUrls(SITEMAP_URL)

    if (urlList.length === 0) {
      return res.status(500).json({ error: 'No URLs found in sitemap.xml' })
    }

    const [indexNowStatus, googleStatus] = await Promise.all([
      submitIndexNow(urlList),
      submitGoogleSitemap().catch((err) => `error: ${err.message}`),
    ])

    return res.status(200).json({
      submitted: urlList.length,
      indexNowStatus,
      googleStatus,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
