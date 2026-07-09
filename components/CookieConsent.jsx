import { useState, useEffect } from 'react'

// Lightweight cookie-consent banner. Rendered once in _app.js so it appears on
// every page. The banner element is always in the DOM (hidden via CSS) and is
// revealed on first visit until the user chooses; the choice is stored in
// localStorage ('tr_cookie_consent' = 'accepted' | 'declined'). Google AdSense
// / analytics can later read that key to gate personalized ads.
const KEY = 'tr_cookie_consent'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch (e) { /* localStorage blocked → don't nag */ }
  }, [])

  const choose = (value) => {
    try { localStorage.setItem(KEY, value) } catch (e) {}
    setShow(false)
  }

  return (
    <div className={`tr-cookie${show ? ' tr-cookie-show' : ''}`} role="dialog" aria-label="Cookie consent" aria-hidden={!show}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
          🍪 We value your privacy
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#94A3B8', margin: '0 0 14px' }}>
          ToolsRift processes your files in your browser. We use cookies only for basic
          analytics and to support ads that keep every tool free. See our{' '}
          <a href="/cookies" style={{ color: '#3B82F6', textDecoration: 'none' }}>Cookie Policy</a>.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => choose('accepted')}
            style={{
              flex: '1 1 120px', minHeight: 40, borderRadius: 10, cursor: 'pointer',
              border: 'none', background: '#3B82F6', color: '#fff',
              fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => choose('declined')}
            style={{
              flex: '1 1 120px', minHeight: 40, borderRadius: 10, cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.14)', background: 'transparent',
              color: '#94A3B8', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Decline
          </button>
        </div>
    </div>
  )
}
