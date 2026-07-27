/**
 * submit-indexnow.js
 * Pushes every URL in public/sitemap.xml to the IndexNow API, which fans out
 * to all participating search engines (Bing, Yandex, Seznam.cz, Naver, Yep — not Google).
 * Run after generate-sitemap.js: node scripts/submit-indexnow.js
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

const HOST = 'toolsrift.com'
const KEY = '509a62672848f5997b1eb6f154172d3a'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'api.indexnow.org'

const sitemapPath = path.join(__dirname, '../public/sitemap.xml')
const xml = fs.readFileSync(sitemapPath, 'utf8')
const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])

if (urlList.length === 0) {
  console.error('No URLs found in sitemap.xml — aborting.')
  process.exit(1)
}

// IndexNow accepts up to 10,000 URLs per request
const BATCH_SIZE = 10000
const batches = []
for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
  batches.push(urlList.slice(i, i + BATCH_SIZE))
}

function submitBatch(urls) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    })
    const req = https.request(
      {
        hostname: ENDPOINT,
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve({ status: res.statusCode, data }))
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

;(async () => {
  console.log(`Submitting ${urlList.length} URLs to IndexNow (${batches.length} batch(es))...`)
  for (const [i, batch] of batches.entries()) {
    const res = await submitBatch(batch)
    // 200 = accepted, 202 = accepted (key not yet validated by all engines)
    const ok = res.status === 200 || res.status === 202
    console.log(`Batch ${i + 1}/${batches.length}: HTTP ${res.status} ${ok ? '✓' : '✗ ' + res.data}`)
    if (!ok) process.exitCode = 1
  }
})()
