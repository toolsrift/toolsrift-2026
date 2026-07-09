import { useState, useEffect } from 'react'

// Global "back to top" button. Rendered once in _app.js so it appears on every
// page. Shows after the user scrolls down, smooth-scrolls to top on click.
// Positioned bottom-right, lifted on small screens so it clears the mobile
// "All Tools" bar that some tool pages render at the bottom.
export default function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Scroll back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`tr-to-top${show ? ' tr-show' : ''}`}
    >
      ↑
    </button>
  )
}
