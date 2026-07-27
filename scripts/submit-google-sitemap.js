/**
 * submit-google-sitemap.js
 * Asks Google to recrawl public/sitemap.xml via the Search Console API
 * (sitemaps.submit — a recrawl request, not a guarantee of indexing).
 * Requires GOOGLE_SERVICE_ACCOUNT_KEY (full service-account JSON) in env
 * or .env.local, and that service account added as a "Full" user on the
 * toolsrift.com Search Console property. See CLAUDE.md for setup steps.
 *
 * Run: node scripts/submit-google-sitemap.js
 */
const fs = require('fs')
const path = require('path')
const { JWT } = require('google-auth-library')

// Minimal .env.local loader (no dotenv dependency) — only fills vars not already set
const envPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)$/)
    if (!match) continue
    const [, key, rawVal] = match
    if (process.env[key] !== undefined) continue
    let val = rawVal.trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

// toolsrift.com is a Domain property in Search Console (verified via DNS), so the
// Search Console API identifies it as "sc-domain:toolsrift.com", not a URL-prefix form.
const SITE_URL = 'sc-domain:toolsrift.com'
const SITEMAP_URL = 'https://toolsrift.com/sitemap.xml'

;(async () => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    console.error('GOOGLE_SERVICE_ACCOUNT_KEY not set — see CLAUDE.md for setup steps. Skipping.')
    process.exit(0)
  }

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
  console.log(`Google sitemap resubmit: HTTP ${res.status}`)
})().catch((err) => {
  console.error('Google sitemap submission failed:', err.message)
  process.exitCode = 1
})
